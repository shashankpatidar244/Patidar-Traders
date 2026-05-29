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

    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // ================= SORT =================

    let orderBy: Prisma.CategoryOrderByWithRelationInput = {
      createdAt: "desc",
    };

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

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
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

      prisma.category.count({
        where,
      }),
    ]);

    // ================= RESPONSE =================

    return NextResponse.json({
      data: categories,

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);

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
          error: "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedName = name.toLowerCase();

    // ================= CHECK EXISTING =================

    const existingCategory = await prisma.category.findUnique({
      where: {
        name: normalizedName,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          error: "Category already exists",
        },
        {
          status: 400,
        }
      );
    }

    // ================= CREATE =================

    const category = await prisma.category.create({
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

    return NextResponse.json(category, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

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
