import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";

const ALLOWED_ORDER_STATUS = ["PENDING", "CONFIRMED", "PACKED"] as const;

const BLOCKED_ORDER_STATUS = ["COMPLETED", "CANCELLED"] as const;

const ALLOWED_DELIVERY_STATUS = ["PENDING", "PACKED"] as const;

const BLOCKED_DELIVERY_STATUS = [
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
] as const;

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (BLOCKED_ORDER_STATUS.includes(order.status as any)) {
      return NextResponse.json(
        { error: "This order cannot be cancelled" },
        { status: 400 }
      );
    }

    if (BLOCKED_DELIVERY_STATUS.includes(order.deliveryStatus as any)) {
      return NextResponse.json(
        {
          error: "Order is already in shipping process and cannot be cancelled",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_ORDER_STATUS.includes(order.status as any) ||
      !ALLOWED_DELIVERY_STATUS.includes(order.deliveryStatus as any)
    ) {
      return NextResponse.json(
        { error: "Order cannot be cancelled at this stage" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // restore stock
      const shouldRestoreStock =
        order.status === "CONFIRMED" ||
        order.status === "PACKED" ||
        order.status === "COMPLETED";

      if (shouldRestoreStock) {
        for (const item of order.items) {
          if (!item.variantId) continue;

          const variant = await tx.productVariant.findUnique({
            where: {
              id: item.variantId,
            },
          });

          if (!variant) continue;

          const oldStock = variant.stock;
          const newStock = oldStock + item.quantity;

          await tx.productVariant.update({
            where: {
              id: item.variantId,
            },
            data: {
              stock: newStock,
            },
          });

          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,
              oldStock,
              newStock,
              action: "ADD",
              adminId: null,
            },
          });
        }
      }

      // cancel order
      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "CANCELLED",
          deliveryStatus: "PENDING",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    return NextResponse.json(
      {
        error: "Failed to cancel order",
      },
      {
        status: 500,
      }
    );
  }
}
