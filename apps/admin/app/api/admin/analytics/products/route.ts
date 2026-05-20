import { prisma } from "@repo/database"
import { logAction } from "../../../../lib/logger"

export const revalidate = 60

// ✅ GET PRODUCTS
export async function GET() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,

      images: {
        select: {
          id: true,
          url: true,
        },
      },

      variants: {
        select: {
          id: true,
          name: true,
          value: true,
          unit: true,
          mrp: true,
          sellingPrice: true,
          stock: true,
        },
      },
    },
    where: {
      isActive: true,
    },
  })

  return Response.json(products)
}

// ✅ CREATE PRODUCT
export async function POST(req: Request) {
  const body = await req.json()

  const product = await prisma.product.create({
    data: {
      name: body.name,
      isActive: body.isActive,

      images: {
        create:
          body.images?.map((img: any) => ({
            url: img.url,
          })) || [],
      },

      variants: {
        create:
          body.variants?.map((v: any) => ({
            name: v.name,
            value: v.value,
            unit: v.unit,

            // ✅ UPDATED PRICE STRUCTURE
            mrp: Number(v.mrp),
            sellingPrice: Number(v.sellingPrice),

            stock: Number(v.stock),
          })) || [],
      },
    },
  })

  // ✅ Log product creation
  await logAction("CREATE", "PRODUCT", product.id)

  return Response.json(product)
}