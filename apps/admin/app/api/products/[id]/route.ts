import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = Number(id)

    const body = await req.json()

    console.log("UPDATE BODY:", body)

    // ✅ validation
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // 🔥 EXTRA VALIDATION (recommended)
    for (const v of body.variants) {
      if (v.sellingPrice > v.mrp) {
        return NextResponse.json(
          { error: "Selling price cannot be greater than MRP" },
          { status: 400 }
        )
      }
    }

    // ✅ UPDATE PRODUCT
    const updatedProduct = await prisma.product.update({
      where: { id: productId },

      data: {
        name: body.name,
        description: body.description || "",

        // 🔥 RESET + RECREATE IMAGES
        images: {
          deleteMany: {},
          create: body.images.map((url: string) => ({
            url,
          })),
        },

        // 🔥 RESET + RECREATE VARIANTS
        variants: {
          deleteMany: {},
          create: body.variants.map((v: any) => ({
            name: `${v.value} ${v.unit}`,
            value: v.value,
            unit: v.unit,

            // ✅ UPDATED PRICING
            mrp: Number(v.mrp) || 0,
            sellingPrice: Number(v.sellingPrice) || 0,

            stock: Number(v.stock),
          })),
        },
      },

      include: {
        images: true,
        variants: true,
      },
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    })
  } catch (error) {
    console.error("PATCH ERROR:", error)

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = Number(id)

    if (!productId || isNaN(productId)) {
      return Response.json({ error: "Invalid ID" }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existing) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    return Response.json({
      success: true,
      message: "Product deleted",
    })
  } catch (error) {
    console.error("DELETE ERROR:", error)

    return Response.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}