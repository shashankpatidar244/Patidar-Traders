import { prisma } from "@repo/database";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);

  const limit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";

  const status = searchParams.get("status") || "";

  const sortRaw = searchParams.get("sort");

  const sort = sortRaw && sortRaw.length > 0 ? sortRaw : "name_asc";

  // PRODUCT WHERE
  const where: Prisma.ProductWhereInput = {};

  // SEARCH
  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (status === "IN") {
    where.variants = {
      some: {
        stock: {
          gte: 10,
        },
      },
    };
  }

  if (status === "LOW") {
    where.variants = {
      some: {
        stock: {
          gt: 0,
          lt: 10,
        },
      },
    };
  }

  if (status === "OUT") {
    where.variants = {
      some: {
        stock: 0,
      },
    };
  }

  // SORT
  let orderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] = {
    name: "asc",
  };

  switch (sort) {
    case "name_desc":
      orderBy = {
        name: "desc",
      };
      break;

    case "name_asc":
    default:
      orderBy = {
        name: "asc",
      };
  }

  // FETCH PRODUCTS
  const [data, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,

      include: {
        images: true,

        variants: {
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
      orderBy,

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
    limit,
    totalPages: pages,
    totalProducts,
  });
}
