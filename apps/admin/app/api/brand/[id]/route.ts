import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

// PATCH
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const numericId = Number(id)

  const { name } = await req.json()
  const normalized = name.trim().toLowerCase()

  // ✅ FIXED Prisma query
  const exists = await prisma.brand.findFirst({
    where: {
      name: normalized,
      NOT: { id: numericId },
    },
  })

  if (exists) {
    return NextResponse.json({ error: "Duplicate name" }, { status: 400 })
  }

  const updated = await prisma.brand.update({
    where: { id: numericId },
    data: { name: normalized },
  })

  return NextResponse.json(updated)
}

//  DELETE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const numericId = Number(id)

  const { moveToBrandId } = await req.json()

  const brand = await prisma.brand.findUnique({
    where: { id: numericId },
    include: { products: true },
  })

  if (!brand) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // 🚨 Has products
  if (brand.products.length > 0) {
    if (!moveToBrandId) {
      return NextResponse.json(
        { error: "BRAND_HAS_PRODUCTS" },
        { status: 400 }
      )
    }

    await prisma.product.updateMany({
      where: { brandId: numericId },
      data: { brandId: moveToBrandId },
    })
  }

  await prisma.brand.delete({
    where: { id: numericId },
  })

  return NextResponse.json({ success: true })
}