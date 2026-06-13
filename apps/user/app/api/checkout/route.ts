import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/getUserFromRequest";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import Razorpay from "razorpay";

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    throw new Error("Razorpay configuration missing");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
}

type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: {
    product: true;
    variant: true;
  };
}>;

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const paymentMethod = body.paymentMethod;
    const addressId = Number(body.addressId);
    const selectedItems = body.selectedItems;

    // FETCH CART

    let cartItems: CartItemWithRelations[];

    if (selectedItems) {
      const ids = selectedItems.split(",").map(Number).filter(Boolean);

      cartItems = await prisma.cartItem.findMany({
        where: {
          userId: user.id,
          id: {
            in: ids,
          },
        },
        include: {
          product: true,
          variant: true,
        },
      });
    } else {
      cartItems = await prisma.cartItem.findMany({
        where: {
          userId: user.id,
        },
        include: {
          product: true,
          variant: true,
        },
      });
    }

    if (!cartItems.length) {
      return NextResponse.json(
        {
          error: "Cart is empty",
        },
        { status: 400 }
      );
    }

    // ADDRESS VALIDATION

    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        {
          error: "Address not found",
        },
        { status: 400 }
      );
    }

    // PRODUCT + PRICE + STOCK VALIDATION

    let total = 0;

    for (const item of cartItems) {
      if (!item.variant) {
        return NextResponse.json(
          {
            error: `${item.product.name} variant missing`,
          },
          { status: 400 }
        );
      }

      if (!item.product.isActive) {
        return NextResponse.json(
          {
            error: `${item.product.name} is unavailable`,
          },
          { status: 400 }
        );
      }

      if (
        item.variant.sellingPrice === null ||
        item.variant.sellingPrice <= 0
      ) {
        return NextResponse.json(
          {
            error: `${item.product.name} price invalid`,
          },
          { status: 400 }
        );
      }

      // validate stock only
      // do NOT reserve stock here
      if (item.variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `${item.product.name} is out of stock`,
          },
          { status: 400 }
        );
      }

      total += item.variant.sellingPrice * item.quantity;
    }

    // ORDER EXPIRY 10 min
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const selectedCartIds = cartItems.map((x) => x.id);

    // CREATE ORDER
 
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,

          total,

          status:
            paymentMethod === "COD"
              ? OrderStatus.CONFIRMED
              : OrderStatus.PENDING,

          paymentMethod:
            paymentMethod === "ONLINE" ? PaymentMethod.CARD : PaymentMethod.COD,

          paymentStatus: PaymentStatus.PENDING,

          deliveryStatus: DeliveryStatus.PENDING,

          expiresAt: paymentMethod === "ONLINE" ? expiresAt : null,

          selectedCartIds,

          shippingName: address.fullName,
          shippingPhone: address.phone,
          shippingLine1: address.line1,
          shippingLine2: address.line2,
          shippingCity: address.city,
          shippingState: address.state,
          shippingPincode: address.pincode,
        },
      });

      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: createdOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant!.sellingPrice!,
        })),
      });

      return createdOrder;
    });

    // COD FLOW
  
    if (paymentMethod === "COD") {
      await prisma.$transaction(async (tx) => {
        // REDUCE STOCK AT COD ORDER CREATION
  
        for (const item of cartItems) {
          const updated = await tx.productVariant.updateMany({
            where: {
              id: item.variantId!,
              stock: {
                gte: item.quantity,
              },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (updated.count === 0) {
            throw new Error(`${item.product.name} stock changed. Please retry`);
          }
        }

        // DELETE CART
   
        await tx.cartItem.deleteMany({
          where: {
            userId: user.id,
            id: {
              in: selectedCartIds,
            },
          },
        });
      });

      return NextResponse.json({
        success: true,
        type: "COD",
        orderId: order.id,
      });
    }

    // ONLINE
    const razorpay = getRazorpay();

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: `order_${order.id}`,
        notes: {
          orderId: String(order.id),
          userId: String(user.id),
        },
      });

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          razorpayOrderId: razorpayOrder.id,
        },
      });

      return NextResponse.json({
        success: true,
        type: "ONLINE",

        orderId: order.id,

        razorpayOrderId: razorpayOrder.id,

        amount: razorpayOrder.amount,

        key: process.env.RAZORPAY_KEY,

        expiresAt,
      });
    } catch (error) {
      console.error(error);

      // PAYMENT ORDER CREATION FAILED
      
      await prisma.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({
          where: {
            orderId: order.id,
          },
        });

        await tx.order.delete({
          where: {
            id: order.id,
          },
        });
      });

      return NextResponse.json(
        {
          error: "Unable to initialize payment",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Checkout Error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Checkout failed",
      },
      { status: 500 }
    );
  }
}
