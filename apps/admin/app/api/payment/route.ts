import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import {
  Prisma,
  PaymentStatus,
  PaymentMethod,
  OrderStatus,
  DeliveryStatus,
} from "@prisma/client";

import { logAdminAction } from "../../lib/adminLog";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const status = searchParams.get("status") || "";
    const deliveryStatus = searchParams.get("deliveryStatus") || "";
    const sort = searchParams.get("sort") || "newest";

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    // SEARCH
    const isNumber =
    search.trim() !== "" && !isNaN(Number(search));
    // WHERE
    const where: any = {
      ...(search
        ? {
            OR: [
              ...(isNumber
                ? [
                    {
                      id: Number(search),
                    },
                  ]
                : []),

              {
                razorpayOrderId: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                razorpayPaymentId: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                shippingName: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                user: {
                  phone: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),

      ...(paymentStatus && {
        paymentStatus: paymentStatus as PaymentStatus,
      }),

      ...(paymentMethod && {
        paymentMethod: paymentMethod as PaymentMethod,
      }),

      ...(status && {
        status: status as OrderStatus,
      }),
      
      ...(deliveryStatus && {
        deliveryStatus: deliveryStatus as DeliveryStatus,
      }),
    };

    // SORT
    let orderBy: Prisma.OrderOrderByWithRelationInput = {
      createdAt: "desc",
    };
    
    switch (sort) {
      case "oldest":
        orderBy = {
          createdAt: "asc",
        };
        break;
    
      case "highest":
        orderBy = {
          total: "desc",
        };
        break;
    
      case "lowest":
        orderBy = {
          total: "asc",
        };
        break;
    
      case "newest":
      default:
        orderBy = {
          createdAt: "desc",
        };
    }

    // FETCH
    const [payments, total] = await Promise.all([
      prisma.order.findMany({
        where,

        include: {
          user: {
            select: {
              id: true,
              username: true,
              phone: true,
            },
          },

          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },

              variant: {
                select: {
                  id: true,
                  value: true,
                  unit: true,
                },
              },
            },
          },
        },

        orderBy,

        skip,

        take: limit,
      }),

      prisma.order.count({
        where,
      }),
    ]);

    // DECIMAL FIX
    const formattedPayments = payments.map((payment) => ({
      ...payment,

      total: Number(payment.total),

      items: payment.items.map((item) => ({
        ...item,

        price: Number(item.price),
      })),
    }));

    return NextResponse.json({
      data: formattedPayments,

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch payments",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();

    let status: PaymentStatus = "PENDING";

    if (action === "MARK_PAID") {
      status = "PAID";
    }

    if (action === "FAIL") {
      status = "FAILED";
    }

    if (action === "REFUND") {
      status = "REFUNDED";
    }

    if (action === "SET_PENDING") {
      status = "PENDING";
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },

      data: {
        paymentStatus: status,

        ...(status === "PAID"
          ? {
              paidAt: new Date(),
            }
          : {}),
      },
    });

    // LOG ACTION
    await logAdminAction({
      action,
      entity: "ORDER",
      entityId: id,
    });

    return NextResponse.json({
      success: true,

      data: {
        ...updatedOrder,

        total: Number(updatedOrder.total),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update payment status",
      },
      {
        status: 500,
      }
    );
  }
}
