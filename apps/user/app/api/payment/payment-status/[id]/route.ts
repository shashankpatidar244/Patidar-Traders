import { prisma } from "@repo/database";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const orderId = Number(id);

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Invalid order id",
        },
        {
          status: 400,
        }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // DEVELOPMENT BYPASS
    //
    // REMOVE NOTHING.
    // ONLY CHANGE ENV:
    //
    // PAYMENT_DEV_BYPASS=true
    //
    // TO
    //
    // PAYMENT_DEV_BYPASS=false
    //
    // WHEN PRODUCTION WEBHOOK IS READY.
    // =====================================================

    const DEV_BYPASS = process.env.PAYMENT_DEV_BYPASS === "true";

    if (DEV_BYPASS && order.paymentStatus === PaymentStatus.PENDING) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.CONFIRMED,

            paidAt: new Date(),

            razorpayPaymentId:
              order.razorpayPaymentId ?? `DEV_PAYMENT_${Date.now()}`,
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

      return NextResponse.json({
        paymentStatus: "PAID",
        status: "CONFIRMED",
        source: "DEV_BYPASS",
      });
    }

    // =====================================================
    // PRODUCTION LOGIC
    //
    // WEBHOOK WILL UPDATE:
    //
    // paymentStatus
    // status
    //
    // THIS API ONLY RETURNS CURRENT STATE
    // =====================================================

    return NextResponse.json({
      paymentStatus: order.paymentStatus,
      status: order.status,
      source: "WEBHOOK",
    });
  } catch (error) {
    console.error("Payment Status Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
