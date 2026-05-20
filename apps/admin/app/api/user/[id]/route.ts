import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ FIX
) {
  try {
    const { id } = await context.params // ✅ IMPORTANT


    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        orders: true,
        addresses: true,
        cartItem: true,
        wishlistItems: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}