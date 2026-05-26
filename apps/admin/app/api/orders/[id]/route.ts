import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const orderId = Number(id);

    // INVALID ID CHECK
    if (!orderId || isNaN(orderId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order id",
        },
        {
          status: 400,
        }
      );
    }

    // FETCH ORDER
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        user: {
          select: {
            id: true,
            username: true,
            phone: true,
            createdAt: true,
          },
        },

        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
              },
            },

            variant: true,
          },
        },
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

    // DECIMAL FIX
    const formattedOrder = {
      ...order,

      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),

      total: Number(order.total),

      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedOrder,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
      },
      {
        status: 500,
      }
    );
  }
}
