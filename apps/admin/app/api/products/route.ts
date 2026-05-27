import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

// GET PRODUCTS

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    const status = searchParams.get("status") || "";

    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";

    const sort = searchParams.get("sort") || "";

    const page = Number(searchParams.get("page") || 1);

    const limit = Number(searchParams.get("limit") || 10);

    // WHERE FILTER
    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      }
    }

    if (status) {
      where.isActive = status === "active"
    }

    if (category) {
      where.categoryId = Number(category)
    }

    if (brand) {
      where.brandId = Number(brand)
    }
    

    
    // SORTING
let orderBy: any = {
  name: "asc", // DEFAULT A-Z
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
      skip: (page - 1) * limit,
      take: limit,
    })

    // SORT BY SELLING PRICE
    if (sort === "price_low") {
      products = products.sort((a: any, b: any) => {
        const aPrice = Math.min(
          ...a.variants.map((v: any) => v.sellingPrice ?? 0)
        );

        const bPrice = Math.min(
          ...b.variants.map((v: any) => v.sellingPrice ?? 0)
        );

        return aPrice - bPrice;
      });
    }

    if (sort === "price_high") {
      products = products.sort((a: any, b: any) => {
        const aPrice = Math.max(
          ...a.variants.map((v: any) => v.sellingPrice ?? 0)
        );

        const bPrice = Math.max(
          ...b.variants.map((v: any) => v.sellingPrice ?? 0)
        );

        return bPrice - aPrice;
      });
    }


    const total = await prisma.product.count({
      where,
    });

    return NextResponse.json({
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
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

    const categoryId = body.categoryId
      ? Number(body.categoryId)
      : null;

    const brandId = body.brandId
      ? Number(body.brandId)
      : null;

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
              sellingPrice: v.sellingPrice
                ? Number(v.sellingPrice)
                : null,
        
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
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}