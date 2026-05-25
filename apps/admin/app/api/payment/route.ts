import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

import { logAdminAction } from "../../lib/adminLog";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // SEARCH PARAMS
    const search = searchParams.get("search") || "";

    const status = searchParams.get("status") || "";

    const method = searchParams.get("method") || "";

    const sort = searchParams.get("sort") || "newest";

    // PAGINATION
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
            ],
          }
        : {}),

      ...(status && {
        paymentStatus: status,
      }),

      ...(method && {
        paymentMethod: method,
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
          user: true,

          items: true,
        },

        orderBy,

        skip,

        take: limit,
      }),

      prisma.order.count({
        where,
      }),
    ]);

    return NextResponse.json({
      data: payments,

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
  const { id, action } = await req.json();

  let status = "PENDING";

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

  await prisma.order.update({
    where: { id },

    data: {
      paymentStatus: status as any,
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
  });
}
