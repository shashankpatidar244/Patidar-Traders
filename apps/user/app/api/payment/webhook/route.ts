import crypto from "crypto";
import { prisma } from "@repo/database";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(body);

    const event = payload.event;

    /**
     * payment.captured
     * payment.authorized
     */
    if (event === "payment.captured" || event === "payment.authorized") {
      const payment = payload.payload.payment.entity;

      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      const order = await prisma.order.findFirst({
        where: {
          razorpayOrderId,
        },
      });

      if (!order) {
        return NextResponse.json({
          success: true,
          ignored: true,
        });
      }

      // already paid
      if (order.paymentStatus === PaymentStatus.PAID) {
        return NextResponse.json({
          success: true,
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.CONFIRMED,
            razorpayPaymentId,
            paidAt: new Date(),
          },
        });

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
    }

    /**
     * payment.failed
     */
    if (event === "payment.failed") {
      const payment = payload.payload.payment.entity;

      const razorpayOrderId = payment.order_id;

      const order = await prisma.order.findFirst({
        where: {
          razorpayOrderId,
        },
      });

      if (order) {
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Webhook Error:", error);

    return NextResponse.json(
      {
        error: "Webhook failed",
      },
      {
        status: 500,
      }
    );
  }
}
