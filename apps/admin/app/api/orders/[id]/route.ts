import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ FIX
) {
  // ✅ unwrap params
  const { id } = await context.params

  const orderId = Number(id)

  // ❌ invalid id protection
  if (!orderId || isNaN(orderId)) {
    return NextResponse.json(
      { error: "Invalid order id" },
      { status: 400 }
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: { images: true },
          },
          variant: true,
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(order)
}