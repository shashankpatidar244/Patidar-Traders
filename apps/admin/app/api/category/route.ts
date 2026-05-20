import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const search = searchParams.get("search") || ""
  const sort = searchParams.get("sort") || "newest"

  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 10)

  const skip = (page - 1) * limit

  let orderBy: any = { createdAt: "desc" }

  if (sort === "oldest") orderBy = { createdAt: "asc" }
  if (sort === "most") orderBy = { products: { _count: "desc" } }
  
  const where = {
    name: { contains: search, mode: "insensitive" as const },
  }

  const total = await prisma.category.count({ where })

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
    skip,
    take: limit,
    include: {
      _count: { select: { products: true } },
    },
  })

  return NextResponse.json({
    data: categories,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    const normalized = name.trim().toLowerCase()

    if (!normalized) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }

    const exists = await prisma.category.findUnique({
      where: { name: normalized },
    })

    if (exists) {
      return NextResponse.json({ error: "Category exists" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name: normalized },
    })

    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}