import { prisma } from "@repo/database";
import {
  DeliveryStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  OrderStatus,
} from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const deliveryStatus = searchParams.get("deliveryStatus") || "";
    const sort = searchParams.get("sort") || "newest";
    // DATE RANGE
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // WHERE
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    if (paymentMethod === "ONLINE") {
      where.paymentMethod = {
        in: ["UPI", "CARD"],
      };
    } else if (paymentMethod) {
      where.paymentMethod = paymentMethod as PaymentMethod;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (deliveryStatus) {
      where.deliveryStatus = deliveryStatus as DeliveryStatus;
    }

    if (from || to) {
  where.createdAt = {};

  if (from) {
    where.createdAt.gte = new Date(from);
  }

  if (to) {
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);

    where.createdAt.lte = endDate;
  }
}

    // SEARCH
    if (search) {
      where.OR = [
        ...(Number(search)
          ? [
              {
                id: Number(search),
              },
            ]
          : []),

        {
          shippingName: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          shippingPhone: {
            contains: search,
          },
        },

        {
          trackingId: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          user: {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
        },

        {
          user: {
            phone: {
              contains: search,
            },
          },
        },
      ];
    }

    // DATE FILTER
    if (from || to) {
      where.createdAt = {};

      if (from) {
        where.createdAt.gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);

        where.createdAt.lte = endDate;
      }
    }

    // SORTING
    let orderBy:
      | Prisma.OrderOrderByWithRelationInput
      | Prisma.OrderOrderByWithRelationInput[] = [
      {
        createdAt: "desc",
      },
    ];

    switch (sort) {
      case "oldest":
        orderBy = [
          {
            createdAt: "asc",
          },
        ];
        break;

      case "highest":
        orderBy = [
          {
            total: "desc",
          },
        ];
        break;

      case "lowest":
        orderBy = [
          {
            total: "asc",
          },
        ];
        break;

      case "id_asc":
        orderBy = [
          {
            id: "asc",
          },
        ];
        break;

      case "id_desc":
        orderBy = [
          {
            id: "desc",
          },
        ];
        break;

      case "newest":
      default:
        orderBy = [
          {
            createdAt: "desc",
          },
          {
            id: "desc",
          },
        ];
    }

    // FETCH DATA
    const [orders, total] = await Promise.all([
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
                  name: true,
                  value: true,
                  unit: true,
                },
              },
            },
          },
        },

        orderBy,

        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.order.count({
        where,
      }),
    ]);

    // DECIMAL FIX
    const formattedOrders = orders.map((order) => ({
      ...order,

      total: Number(order.total),

      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }));

    return NextResponse.json({
      success: true,

      data: formattedOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      {
        status: 500,
      }
    );
  }
}
