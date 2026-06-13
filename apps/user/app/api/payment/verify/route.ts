import crypto from "crypto";
import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { InventoryAction, OrderStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // BASIC VALIDATION

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          error: "Missing payment data",
        },
        { status: 400 }
      );
    }

    // VERIFY SIGNATURE

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        {
          error: "Invalid signature",
        },
        { status: 400 }
      );
    }

    // FETCH ORDER

    const order = await prisma.order.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // IDEMPOTENT CHECK

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        orderId: order.id,
      });
    }

    // EXPIRED PAYMENT CHECK

    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          error: "Payment session expired",
        },
        { status: 400 }
      );
    }

    // TRANSACTION

    await prisma.$transaction(async (tx) => {
      // REFETCH ORDER INSIDE TX

      const freshOrder = await tx.order.findUnique({
        where: {
          id: order.id,
        },
      });

      if (!freshOrder) {
        throw new Error("Order not found");
      }

      // DUPLICATE PROTECTION

      if (freshOrder.paymentStatus === PaymentStatus.PAID) {
        return;
      }

      // STOCK VALIDATION + REDUCTION

      for (const item of order.items) {
        if (!item.variantId) {
          throw new Error(`${item.product.name} variant missing`);
        }

        const currentVariant = await tx.productVariant.findUnique({
          where: {
            id: item.variantId,
          },
        });

        if (!currentVariant) {
          throw new Error(`${item.product.name} variant not found`);
        }

        // ATOMIC STOCK REDUCTION

        const result = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
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

        // PREVENT NEGATIVE STOCK

        if (result.count === 0) {
          throw new Error(
            `${item.product.name} went out of stock during payment verification`
          );
        }

        // INVENTORY LOG

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            oldStock: currentVariant.stock,
            newStock: currentVariant.stock - item.quantity,
            action: InventoryAction.REDUCE,
          },
        });
      }

      // MARK PAYMENT SUCCESS

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: PaymentStatus.PAID,

          status: OrderStatus.CONFIRMED,

          razorpayPaymentId: razorpay_payment_id,

          razorpaySignature: razorpay_signature,

          paidAt: new Date(),
        },
      });

      // DELETE ONLY CHECKED OUT CART ITEMS

      const selectedIds = (order.selectedCartIds as number[]) || [];

      if (selectedIds.length > 0) {
        await tx.cartItem.deleteMany({
          where: {
            userId: order.userId,
            id: {
              in: selectedIds,
            },
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Payment Verification Error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Verification failed",
      },
      { status: 500 }
    );
  }
}
