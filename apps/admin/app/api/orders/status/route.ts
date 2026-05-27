import { prisma } from "@repo/database";

import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";

import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const {
      orderId,
      status,
      deliveryStatus,
    }: {
      orderId: number;
      status?: OrderStatus;
      deliveryStatus?: DeliveryStatus;
    } = await req.json();

    const validStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PACKED",
      "COMPLETED",
      "CANCELLED",
    ];

    const validDeliveryStatuses: DeliveryStatus[] = [
      "PENDING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED",
    ];

    // VALIDATE ORDER STATUS
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status",
        },
        {
          status: 400,
        }
      );
    }

    // VALIDATE DELIVERY STATUS
    if (
      deliveryStatus &&
      !validDeliveryStatuses.includes(deliveryStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid delivery status",
        },
        {
          status: 400,
        }
      );
    }

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

    const nextStatus = status || currentStatus;

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

    // ORDER STATUS FLOW RULES
    const invalidFlow =
      (currentStatus === "PENDING" &&
        !["CONFIRMED", "CANCELLED"].includes(nextStatus)) ||

      (currentStatus === "CONFIRMED" &&
        !["PACKED", "CANCELLED"].includes(nextStatus)) ||

      (currentStatus === "PACKED" &&
        !["PACKED", "COMPLETED", "CANCELLED"].includes(
          nextStatus
        ));

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

    // COMPLETED ONLY AFTER DELIVERED
    if (
      nextStatus === "COMPLETED" &&
      order.deliveryStatus !== "DELIVERED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order can only be completed after delivery is delivered",
        },
        {
          status: 400,
        }
      );
    }

    // TRANSACTION
    const updatedOrder = await prisma.$transaction(
      async (tx) => {
      // CONFIRM ORDER → REDUCE STOCK
      if (
        nextStatus === "CONFIRMED" &&
        currentStatus === "PENDING"
      ) {
        for (const item of order.items) {
          if (!item.variantId) continue;

          const variant = await tx.productVariant.findUnique({
            where: {
              id: item.variantId,
            },
          });

          // OUT OF STOCK
          if (!variant || variant.stock < item.quantity) {
            throw new Error(
              `Out of stock for variant ${item.variantId}`
            );
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
      if (
        nextStatus === "CANCELLED" &&
        currentStatus !== "PENDING"
      ) {
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

      let finalDeliveryStatus =
        deliveryStatus || order.deliveryStatus;

      if (
        currentStatus === "CONFIRMED" &&
        nextStatus === "PACKED"
      ) {
        finalDeliveryStatus = "PACKED";
      }

      if (nextStatus === "COMPLETED") {
        finalDeliveryStatus = "DELIVERED";
      }

      // UPDATE ORDER
      return await tx.order.update({
        where: {
          id: Number(orderId),
        },

        data: {
          status: nextStatus,

          paymentStatus,

          deliveryStatus: finalDeliveryStatus,

          paidAt:
            nextStatus === "CONFIRMED"
              ? new Date()
              : undefined,
        },
      });
    },
    {
      timeout: 20000,
    }
  );

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