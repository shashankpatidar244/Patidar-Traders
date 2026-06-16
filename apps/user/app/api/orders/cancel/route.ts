import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";

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

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending orders can be cancelled" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
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
        
        // Update stock
        await tx.productVariant.update({
          where: {
            id: item.variantId,
          },
          data: {
            stock: newStock,
          },
        });
        
        // Create inventory audit log
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

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "CANCELLED",
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
