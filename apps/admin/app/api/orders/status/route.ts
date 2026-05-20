import { prisma } from "@repo/database"
import { OrderStatus } from "@prisma/client"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    const { orderId, status } = await req.json()

    // ✅ VALIDATE STATUS
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "PAID",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const nextStatus = status as OrderStatus

    // ✅ GET ORDER
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const currentStatus = order.status

    // ❌ RULES
    if (currentStatus === "DELIVERED") {
      return NextResponse.json(
        { error: "Already delivered" },
        { status: 400 }
      )
    }

    if (currentStatus === "CANCELLED") {
      return NextResponse.json(
        { error: "Already cancelled" },
        { status: 400 }
      )
    }

    if (nextStatus === "SHIPPED" && currentStatus !== "PAID") {
      return NextResponse.json(
        { error: "Must be PAID first" },
        { status: 400 }
      )
    }

    if (nextStatus === "DELIVERED" && currentStatus !== "SHIPPED") {
      return NextResponse.json(
        { error: "Must be SHIPPED first" },
        { status: 400 }
      )
    }

    // 🔥 TRANSACTION (VERY IMPORTANT)
    const result = await prisma.$transaction(async (tx) => {

      // ✅ CONFIRM ORDER → REDUCE STOCK
      if (nextStatus === "PAID" && currentStatus === "PENDING") {
        for (const item of order.items) {
          if (!item.variantId) continue

          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          })

          if (!variant || variant.stock < item.quantity) {
            throw new Error(`Out of stock for variant ${item.variantId}`)
          }

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          })
        }
      }

      // ❌ CANCEL → RESTORE STOCK
      if (nextStatus === "CANCELLED") {
        for (const item of order.items) {
          if (!item.variantId) continue

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
            },
          })
        }
      }

      // ✅ UPDATE ORDER
      return await tx.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
      })
    })

    return NextResponse.json(result)

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}