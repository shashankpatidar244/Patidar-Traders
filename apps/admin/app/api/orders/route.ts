import { prisma } from "@repo/database";

import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const paymentMethod = searchParams.get("paymentMethod") || "";
  const sort = searchParams.get("sort") || "newest";

  const where: any = {};

  if (status) {
    where.status = status as any;
  }
  if (paymentMethod) {
    where.paymentMethod = paymentMethod as any;
  }

  if (search) {
    where.OR = [
      {
        id: Number(search) || undefined,
      },

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
    ];
  }

  // SORT
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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    data: orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
