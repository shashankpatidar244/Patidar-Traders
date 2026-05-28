import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

import {
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";

import { logAdminAction } from "../../lib/adminLog";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    const status = searchParams.get("status") || "";

    const method = searchParams.get("method") || "";

    const sort = searchParams.get("sort") || "newest";

    const page = Number(searchParams.get("page") || 1);

    const limit = Number(searchParams.get("limit") || 10);

    const skip = (page - 1) * limit;

    // SEARCH
    const isNumber = search && !isNaN(Number(search));

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

              // SEARCH USER
              {
                user: {
                  OR: [
                    {
                      username: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                    {
                      phone: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),

      ...(status && {
        paymentStatus: status as PaymentStatus,
      }),

      ...(method && {
        paymentMethod: method as PaymentMethod,
      }),
    };

    // SORT
    let orderBy: any = {
      createdAt: "desc",
    };

    if (sort === "oldest") {
      orderBy = {
        createdAt: "asc",
      };
    }

    if (sort === "amount_desc") {
      orderBy = {
        total: "desc",
      };
    }

    if (sort === "amount_asc") {
      orderBy = {
        total: "asc",
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