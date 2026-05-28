import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

// GET PRODUCTS

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    const status = searchParams.get("status") || "";
    const stock = searchParams.get("stock") || "";

    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";

    const sort = searchParams.get("sort") || "";

    const page = Number(searchParams.get("page") || 1);

    const limit = Number(searchParams.get("limit") || 10);

    // WHERE FILTER
    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          technicalName: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status) {
      where.isActive = status === "active";
    }

    if (category) {
      where.categoryId = Number(category);
    }

    if (brand) {
      where.brandId = Number(brand);
    }

    if (stock === "in") {
      where.variants = {
        some: {
          stock: {
            gt: 0,
          },
        },
      };
    }

    if (stock === "out") {
      where.variants = {
        every: {
          stock: 0,
        },
      };
    }

    // SORTING
    let orderBy: any = {
      name: "asc",
    };

    switch (sort) {
      case "newest":
        orderBy = {
          createdAt: "desc",
        };
        break;

      case "oldest":
        orderBy = {
          createdAt: "asc",
        };
        break;

      case "name_desc":
        orderBy = {
          name: "desc",
        };
        break;

      case "name_asc":
        orderBy = {
          name: "asc",
        };
        break;

      default:
        orderBy = {
          name: "asc",
        };
    }

    // FETCH
    let products = await prisma.product.findMany({
      where,
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
      },
      orderBy,
    });

    // Heper function for SORT
    const getMinPrice = (variants: any[]) => {
      if (!variants?.length) return 0;

      return Math.min(...variants.map((v: any) => v.sellingPrice ?? 0));
    };

    const getTotalStock = (variants: any[]) => {
      if (!variants?.length) return 0;

      return variants.reduce(
        (total: number, v: any) => total + (v.stock || 0),
        0
      );
    };

    // PRICE LOW SELLING PRICE
    if (sort === "price_low") {
      products = products.sort((a: any, b: any) => {
        return getMinPrice(a.variants) - getMinPrice(b.variants);
      });
    }

    // PRICE HIGH SELLING PRICE
    if (sort === "price_high") {
      products = products.sort((a: any, b: any) => {
        return getMinPrice(b.variants) - getMinPrice(a.variants);
      });
    }

    // STOCK LOW
    if (sort === "stock_low") {
      products = products.sort((a: any, b: any) => {
        return getTotalStock(a.variants) - getTotalStock(b.variants);
      });
    }

    // STOCK HIGH
    if (sort === "stock_high") {
      products = products.sort((a: any, b: any) => {
        return getTotalStock(b.variants) - getTotalStock(a.variants);
      });
    }

    const total = products.length;

    const paginatedProducts = products.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      data: paginatedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// CREATE PRODUCT
export async function POST(req: Request) {
  try {
    const body = await req.json();

    /* ================= VALIDATION ================= */

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.variants) || body.variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required" },
        { status: 400 }
      );
    }

    /* ================= SANITIZE ================= */

    const technicalName = body.technicalName?.trim() || null;
    const description = body.description?.trim() || null;

    const categoryId = body.categoryId ? Number(body.categoryId) : null;

    const brandId = body.brandId ? Number(body.brandId) : null;

    /* ================= CREATE ================= */

    const product = await prisma.product.create({
      data: {
        name,
        technicalName,
        description,
        categoryId,
        brandId,
        isActive: true,

        /* ================= IMAGES ================= */
        images: {
          create: Array.isArray(body.images)
            ? body.images
                .filter((url: string) => url) // remove empty
                .map((url: string) => ({
                  url,
                }))
            : [],
        },

        /* ================= VARIANTS ================= */
        variants: {
          create: body.variants.map((v: any) => {
            let variantName = "Unit";

            if (["KG", "GM"].includes(v.unit)) variantName = "Weight";
            if (["L", "ML"].includes(v.unit)) variantName = "Volume";
            if (["PCS"].includes(v.unit)) variantName = "Unit";

            return {
              name: variantName,
              value: `${v.value} ${v.unit}`,

              unit: v.unit,

              mrp: v.mrp ? Number(v.mrp) : null,
              sellingPrice: v.sellingPrice ? Number(v.sellingPrice) : null,

              stock: Number(v.stock) || 0,
            };
          }),
        },
      },

      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    /* ================= PRISMA UNIQUE ERROR ================= */
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Technical name already exists" },
        { status: 400 }
      );
    }

    /* ================= CUSTOM ERRORS ================= */
    if (error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
