import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/getUserFromRequest";

export async function GET() {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },

            variant: true,
          },
        },
      },
    });

    return NextResponse.json(
      orders.map((order) => ({
        id: order.id,

        total: Number(order.total),

        status: order.status,

        paymentStatus: order.paymentStatus,

        paymentMethod: order.paymentMethod,

        deliveryStatus: order.deliveryStatus,

        trackingId: order.trackingId,

        createdAt: order.createdAt,

        updatedAt: order.updatedAt,

        shippingName: order.shippingName,

        shippingPhone: order.shippingPhone,

        shippingLine1: order.shippingLine1,

        shippingLine2: order.shippingLine2,

        shippingCity: order.shippingCity,

        shippingState: order.shippingState,

        shippingPincode: order.shippingPincode,

        items: order.items.map((item) => ({
          id: item.id,

          quantity: item.quantity,

          price: Number(item.price),

          product: {
            id: item.product.id,

            name: item.product.name,

            images: item.product.images,
          },

          variant: item.variant
            ? {
                id: item.variant.id,

                name: item.variant.name,

                value: item.variant.value,

                mrp: item.variant.mrp,

                sellingPrice: item.variant.sellingPrice,
              }
            : null,
        })),
      }))
    );
  } catch (error) {
    console.error("Orders fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
