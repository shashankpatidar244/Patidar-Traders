import { prisma } from "@repo/database"
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    const sort = searchParams.get("sort") || "newest";

    const page = Number(searchParams.get("page") || 1);

    const limit = Number(searchParams.get("limit") || 10);

    const skip = (page - 1) * limit;

    // ================= WHERE =================

    const where: Prisma.BrandWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // ================= SORT =================

    let orderBy: Prisma.BrandOrderByWithRelationInput

    switch (sort) {
      case "oldest":
        orderBy = {
          createdAt: "asc",
        };
        break;

      case "most":
        orderBy = {
          products: {
            _count: "desc",
          },
        };
        break;

      case "name_asc":
        orderBy = {
          name: "asc",
        };
        break;

      case "name_desc":
        orderBy = {
          name: "desc",
        };
        break;

      case "newest":
      default:
        orderBy = {
          createdAt: "desc",
        };
    }

    // ================= FETCH =================

    const [brand, total] = await Promise.all([
      prisma.brand.findMany({
        where,

        orderBy,

        skip,

        take: limit,

        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),

      prisma.brand.count({
        where,
      }),
    ]);

    // ================= RESPONSE =================

    return NextResponse.json({
      data: brand,

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET BRAND ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = body?.name?.trim();

    // ================= VALIDATION =================

    if (!name) {
      return NextResponse.json(
        {
          error: "Brand name is required",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedName = name.toLowerCase();

    // ================= CHECK EXISTING =================

    const existingBrand = await prisma.brand.findUnique({
      where: {
        name: normalizedName,
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        {
          error: "Brand already exists",
        },
        {
          status: 400,
        }
      );
    }

    // ================= CREATE =================

    const brand = await prisma.brand.create({
      data: {
        name: normalizedName,
      },

      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(brand, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE BRAND ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
