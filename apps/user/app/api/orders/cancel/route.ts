import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { getUserFromRequest } from "../../../lib/getUserFromRequest"

export async function POST(req: Request) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { orderId } = await req.json()

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { items: true },
  })

  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Order cannot be cancelled" },
      { status: 400 }
    )
  }

  await prisma.$transaction(async (tx) => {

    // ✅ Restore variant stock
    for (const item of order.items) {

      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }

    }

    // ✅ Update order status
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
      },
    })

  })

  return NextResponse.json({ success: true })
}