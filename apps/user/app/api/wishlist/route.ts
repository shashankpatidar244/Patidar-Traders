import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { getUserFromRequest } from "../../lib/getUserFromRequest"

export async function POST(req: Request) {

  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" })

  const { productId, variantId } = await req.json()

  await prisma.wishlistItem.create({
    data: {
      userId: user.id,
      productId,
      variantId
    }
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" })

  const { id } = await req.json()

  await prisma.wishlistItem.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}

export async function GET() {
  const user = await getUserFromRequest()
  
  // Return an empty array if not logged in to avoid breaking the frontend .length check
  if (!user) return NextResponse.json([])

  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
      },
      // Optional: include product details if your UI needs them later
      include: {
        product: true,
      },
    })

    return NextResponse.json(wishlist)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

