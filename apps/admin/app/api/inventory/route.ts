import { prisma } from "@repo/database";
import { Prisma, Unit } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";
  const stock = searchParams.get("stock") || "";
  const unit = searchParams.get("unit") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";

  const sortRaw = searchParams.get("sort");
  const sort = sortRaw && sortRaw.length > 0 ? sortRaw : "newest";

  // PRODUCT WHERE
  const Filters: Prisma.ProductWhereInput[] = [];

  // SEARCH
  if (search) {
    Filters.push({
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          variants: {
            some: {
              value: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  // FILTER
  if (stock === "IN") {
    Filters.push({
      variants: {
        some: {
          stock: { gte: 10 },
        },
      },
    });
  }

  if (stock === "LOW") {
    Filters.push({
      variants: {
        some: {
          stock: { gt: 0, lt: 10 },
        },
      },
    });
  }

  if (stock === "OUT") {
    Filters.push({
      variants: {
        some: {
          stock: 0,
        },
      },
    });
  }

  if (unit) {
    Filters.push({
      variants: {
        some: {
          unit: unit.toUpperCase() as Unit,
        },
      },
    });
  }

  if (category) {
    Filters.push({
      categoryId: Number(category),
    });
  }

  if (brand) {
    Filters.push({
      brandId: Number(brand),
    });
  }

  const where: Prisma.ProductWhereInput =
    Filters.length > 0 ? { AND: Filters } : {};

  // SORT
  let orderBy: Prisma.ProductOrderByWithRelationInput = {
    createdAt: "desc",
  };

  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;

    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
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
