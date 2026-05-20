import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

// ✅ PATCH
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const numericId = Number(id)

  const { name } = await req.json()
  const normalized = name.trim().toLowerCase()

  // ✅ FIXED Prisma query
  const exists = await prisma.category.findFirst({
    where: {
      name: normalized,
      NOT: { id: numericId },
    },
  })

  if (exists) {
    return NextResponse.json({ error: "Duplicate name" }, { status: 400 })
  }

  const updated = await prisma.category.update({
    where: { id: numericId },
    data: { name: normalized },
  })

  return NextResponse.json(updated)
}

// ✅ DELETE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const numericId = Number(id)

  const { moveToCategoryId } = await req.json()

  const category = await prisma.category.findUnique({
    where: { id: numericId },
    include: { products: true },
  })

  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // 🚨 Has products
  if (category.products.length > 0) {
    if (!moveToCategoryId) {
      return NextResponse.json(
        { error: "CATEGORY_HAS_PRODUCTS" },
        { status: 400 }
      )
    }

    await prisma.product.updateMany({
      where: { categoryId: numericId },
      data: { categoryId: moveToCategoryId },
    })
  }

  await prisma.category.delete({
    where: { id: numericId },
  })

  return NextResponse.json({ success: true })
}