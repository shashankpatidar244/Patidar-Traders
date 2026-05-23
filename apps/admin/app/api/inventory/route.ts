import { prisma } from "@repo/database";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);

  const limit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";

  const status = searchParams.get("status");

  // PRODUCT WHERE
  const where: Prisma.ProductWhereInput = {};

  // SEARCH
  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  // FETCH PRODUCTS
  const [data, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,

      include: {
        images: true,

        variants: {
          where:
            status === "IN"
              ? {
                  stock: {
                    gte: 10,
                  },
                }
              : status === "LOW"
                ? {
                    stock: {
                      gt: 0,
                      lt: 10,
                    },
                  }
                : status === "OUT"
                  ? {
                      stock: 0,
                    }
                  : {},

          orderBy: [
            {
              value: "asc",
            },
            {
              id: "asc",
            },
          ],
        },
      },

      orderBy: {
        name: "asc",
      },

      skip: (page - 1) * limit,

      take: limit,
    }),

    prisma.product.count({
      where,
    }),
  ]);

  // TOTAL PAGES
  const pages = Math.ceil(totalProducts / limit);

  return NextResponse.json({
    data,
    page,
    pages,
    limit,
    totalProducts,
  });
}
