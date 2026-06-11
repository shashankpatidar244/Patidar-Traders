import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/getUserFromRequest";
import {
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  DeliveryStatus,
  Prisma,
} from "@prisma/client";
import Razorpay from "razorpay";

// Razorpay Instance
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    throw new Error("Razorpay env missing");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
}

// Types
type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: { product: true; variant: true };
}>;

// API
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethod, addressId, selectedItems } = await req.json();

    // FETCH CART (FILTERED)
    let cartItems: CartItemWithRelations[];

    if (selectedItems) {
      const ids = selectedItems.split(",").map(Number);

      cartItems = await prisma.cartItem.findMany({
        where: {
          userId: user.id,
          id: { in: ids },
        },
        include: { product: true, variant: true },
      });
    } else {
      cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true, variant: true },
      });
    }

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart empty" }, { status: 400 });
    }

    // TOTAL CALCULATION
    for (const item of cartItems) {
      if (!item.variant) {
        return NextResponse.json(
          {
            error: `${item.product.name} variant not found`,
          },
          { status: 400 }
        );
      }
    }
    const total = cartItems.reduce((sum: number, item) => {
      return sum + Number(item.variant?.sellingPrice ?? 0) * item.quantity;
    }, 0);

    // ADDRESS VALIDATION
    const address = await prisma.address.findFirst({
      where: { id: Number(addressId), userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 400 });
    }

    // EXPIRY (10 min)
    const EXPIRY_MINUTES = 10;
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    // CREATE ORDER (TRANSACTION)
    const selectedCartIds = cartItems.map((item) => item.id);
    const order = await prisma.$transaction(async (tx) => {
      // STOCK CHECK
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
          throw new Error(`${item.product.name} is out of stock`);
        }
      }

      // CREATE ORDER
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,

          status: OrderStatus.PENDING,
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

      // ORDER ITEMS
      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant?.sellingPrice ?? 0,
        })),
      });

      return newOrder;
    });

    // COD FLOW
    if (paymentMethod === "COD") {
      const ids = cartItems.map((item) => item.id);

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PENDING,
          },
        }),

        // DELETE ONLY SELECTED ITEMS
        prisma.cartItem.deleteMany({
          where: {
            userId: user.id,
            id: { in: ids },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        type: "COD",
        orderId: order.id,
      });
    }

    // ONLINE FLOW (RAZORPAY)
    if (paymentMethod === "ONLINE") {
      const razorpay = getRazorpay();

      let razorpayOrder;

      try {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: `order_${order.id}`,
          notes: {
            orderId: order.id.toString(),
            userId: user.id.toString(),
          },
        });
      } catch (err) {
        console.error("Razorpay error:", err);

        await prisma.$transaction([
          prisma.orderItem.deleteMany({
            where: {
              orderId: order.id,
            },
          }),

          prisma.order.delete({
            where: {
              id: order.id,
            },
          }),

          ...cartItems.map((item) =>
            prisma.productVariant.update({
              where: {
                id: item.variantId!,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          ),
        ]);

        throw new Error("Payment gateway error");
      }

      await prisma.order.update({
        where: { id: order.id },
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
        expiresAt: order.expiresAt,
      });
    }

    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  } catch (err: any) {
    console.error("Checkout error:", err);

    return NextResponse.json(
      { error: err.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
