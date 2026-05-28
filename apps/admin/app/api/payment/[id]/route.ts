import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    const paymentId = Number(id);

    // VALIDATION
    if (!paymentId || isNaN(paymentId)) {
      return NextResponse.json(
        {
          error: "Invalid payment id",
        },
        {
          status: 400,
        }
      );
    }

    // FETCH PAYMENT
    const payment = await prisma.order.findUnique({
      where: {
        id: paymentId,
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
              select: {
                id: true,
                name: true,

                images: {
                  take: 1,
                },
              },
            },

            variant: {
              select: {
                id: true,
                name: true,
                value: true,
                unit: true,
                mrp: true,
                sellingPrice: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          error: "Payment not found",
        },
        {
          status: 404,
        }
      );
    }

    // DECIMAL FIX
    const formattedPayment = {
      ...payment,

      total: Number(payment.total),

      items: payment.items.map((item) => ({
        ...item,

        price: Number(item.price),

        product: item.product
          ? {
              ...item.product,

              images: item.product.images || [],
            }
          : null,

        variant: item.variant
          ? {
              ...item.variant,

              mrp: item.variant.mrp ? Number(item.variant.mrp) : null,

              sellingPrice: item.variant.sellingPrice
                ? Number(item.variant.sellingPrice)
                : null,
            }
          : null,
      })),
    };

    return NextResponse.json(formattedPayment);
  } catch (error) {
    console.error("PAYMENT DETAILS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch payment",
      },
      {
        status: 500,
      }
    );
  }
}
