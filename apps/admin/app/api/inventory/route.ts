import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 20)
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status")

  const where: any = {
    product: {
      name: { contains: search, mode: "insensitive" },
    },
  }

  // 📦 STATUS FILTER
  if (status === "IN") where.stock = { gte: 10 }
  if (status === "LOW") where.stock = { gt: 0, lt: 10 }
  if (status === "OUT") where.stock = 0

  const [data, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      include: {
        product: { include: { images: true } },
      },

      // SORT FIX HERE
      orderBy: [
        {
          product: {
            name: "asc", // A → Z
          },
        },
        {
          value: "asc", // optional: variant order
        },
      ],

      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.productVariant.count({ where }),
  ])

  return NextResponse.json({
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}