import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { getUserFromRequest } from "../../../app/lib/getUserFromRequest"


// ===============================
// ADD TO CART
// ===============================
export async function POST(req: Request) {

  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { productId, variantId } = await req.json()

  if (!productId || !variantId) {
    return NextResponse.json({ error: "Invalid data" })
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId }
  })

  if (!variant || variant.stock <= 0) {
    return NextResponse.json({
      error: "Out of stock"
    })
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId: user.id,
      productId,
      variantId
    }
  })

  if (existing) {

    if (existing.quantity >= variant.stock) {
      return NextResponse.json({ error: "Stock limit reached" })
    }

    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 }
    })

  } else {

    await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId,
        variantId,
        quantity: 1
      }
    })

  }

  return NextResponse.json({ success: true })
}


// ===============================
// UPDATE CART QUANTITY
// ===============================
export async function PATCH(req: Request) {

  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, type } = await req.json()

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { variant: true }
  })

  if (!item || item.userId !== user.id) {
    return NextResponse.json({ error: "Item not found" })
  }

  let newQty = item.quantity

  if (type === "inc") {

    if (item.variant && item.quantity >= item.variant.stock) {
      return NextResponse.json({ error: "Out of stock" })
    }

    newQty++

  } else if (type === "dec") {

    newQty--

  }

  if (newQty <= 0) {

    await prisma.cartItem.delete({
      where: { id }
    })

  } else {

    await prisma.cartItem.update({
      where: { id },
      data: { quantity: newQty }
    })

  }

  return NextResponse.json({ success: true })
}


// ===============================
// REMOVE CART ITEM
// ===============================
export async function DELETE(req: Request) {

  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await req.json()

  const item = await prisma.cartItem.findUnique({
    where: { id }
  })

  if (!item || item.userId !== user.id) {
    return NextResponse.json({ error: "Item not found" })
  }

  await prisma.cartItem.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}


// ===============================
// GET USER CART
// ===============================
export async function GET() {

  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json([])
  }

  const cart = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { images: true }
      },
      variant: true
    }
  })

  return NextResponse.json(cart)
}