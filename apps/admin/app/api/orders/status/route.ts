import { prisma } from "@repo/database";

import { DeliveryStatus, OrderStatus, PaymentStatus } from "@prisma/client";

import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { orderId, status } = await req.json();

    const validStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PACKED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status",
        },
        {
          status: 400,
        }
      );
    }

    const nextStatus = status as OrderStatus;

    // FIND ORDER
    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId),
      },

      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    const currentStatus = order.status;

    // STATUS FLOW RULES

    if (currentStatus === "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: "Completed order cannot be modified",
        },
        {
          status: 400,
        }
      );
    }

    if (currentStatus === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Cancelled order cannot be modified",
        },
        {
          status: 400,
        }
      );
    }

    const invalidFlow =
      (currentStatus === "PENDING" &&
        !["CONFIRMED", "CANCELLED"].includes(nextStatus)) ||
      (currentStatus === "CONFIRMED" &&
        !["PACKED", "CANCELLED"].includes(nextStatus)) ||
      (currentStatus === "PACKED" &&
        !["COMPLETED", "CANCELLED"].includes(nextStatus));

    if (invalidFlow) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status flow from ${currentStatus} → ${nextStatus}`,
        },
        {
          status: 400,
        }
      );
    }

    // TRANSACTION

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // CONFIRM ORDER → REDUCE STOCK

      if (nextStatus === "CONFIRMED" && currentStatus === "PENDING") {
        for (const item of order.items) {
          if (!item.variantId) continue;

          const variant = await tx.productVariant.findUnique({
            where: {
              id: item.variantId,
            },
          });

          // OUT OF STOCK
          if (!variant || variant.stock < item.quantity) {
            throw new Error(`Out of stock for variant ${item.variantId}`);
          }

          // REDUCE STOCK
          await tx.productVariant.update({
            where: {
              id: item.variantId,
            },

            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          // INVENTORY LOG
          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,

              oldStock: variant.stock,

              newStock: variant.stock - item.quantity,

              action: "REDUCE",
            },
          });
        }
      }

      // CANCEL ORDER → RESTORE STOCK

      if (nextStatus === "CANCELLED" && currentStatus !== "PENDING") {
        for (const item of order.items) {
          if (!item.variantId) continue;

          const variant = await tx.productVariant.findUnique({
            where: {
              id: item.variantId,
            },
          });

          if (!variant) continue;

          // RESTORE STOCK
          await tx.productVariant.update({
            where: {
              id: item.variantId,
            },

            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });

          // INVENTORY LOG
          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,

              oldStock: variant.stock,

              newStock: variant.stock + item.quantity,

              action: "ADD",
            },
          });
        }
      }

      // PAYMENT STATUS LOGIC

      let paymentStatus: PaymentStatus | undefined;

      if (nextStatus === "CONFIRMED") {
        paymentStatus = "PAID";
      }

      // DELIVERY STATUS LOGIC

      let deliveryStatus: DeliveryStatus | undefined;

      if (nextStatus === "PACKED") {
        deliveryStatus = "PACKED";
      }

      if (nextStatus === "COMPLETED") {
        deliveryStatus = "DELIVERED";
      }

      // UPDATE ORDER

      return await tx.order.update({
        where: {
          id: Number(orderId),
        },

        data: {
          status: nextStatus,

          paymentStatus,

          deliveryStatus,

          paidAt: nextStatus === "CONFIRMED" ? new Date() : undefined,
        },
      });
    });

    // SUCCESS
    return NextResponse.json({
      success: true,
      data: {
        ...updatedOrder,
        total: Number(updatedOrder.total),
      },
    });
  } catch (error: any) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
