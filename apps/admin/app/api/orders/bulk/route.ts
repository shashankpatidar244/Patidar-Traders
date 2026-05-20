import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    const { orderIds, action } = await req.json()

    if (!orderIds?.length) {
      return NextResponse.json({ error: "No orders selected" }, { status: 400 })
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { items: true },
    })
    
    if (!orders.length) {
      return NextResponse.json(
        { error: "No matching orders found" },
        { status: 404 }
      )
    }
    
    // ✅ SAME STATUS CHECK
    const firstStatus = orders[0]?.status
    const allSame = orders.every((o) => o.status === firstStatus)
    
    if (!allSame) {
      return NextResponse.json(
        { error: "Select same status orders only" },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      for (const order of orders) {
        const status = order.status

        // 🟡 PENDING → PAID
        if (action === "CONFIRM" && status === "PENDING") {
          // stock check
          for (const item of order.items) {
            if (!item.variantId) continue

            const v = await tx.productVariant.findUnique({
              where: { id: item.variantId },
            })

            if (!v || v.stock < item.quantity) {
              throw new Error(`Out of stock (order ${order.id})`)
            }
          }

          // reduce stock
          for (const item of order.items) {
            if (!item.variantId) continue

            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            })
          }

          await tx.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          })
        }

        // 🔵 PAID → SHIPPED
        else if (action === "SHIP" && status === "PAID") {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "SHIPPED" },
          })
        }

        // 🟢 SHIPPED → DELIVERED
        else if (action === "DELIVER" && status === "SHIPPED") {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "DELIVERED" },
          })
        }

        // 🔴 CANCEL
        else if (action === "CANCEL" && status !== "DELIVERED") {
          for (const item of order.items) {
            if (!item.variantId) continue

            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            })
          }

          await tx.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
          })
        }

        else {
          throw new Error(`Invalid transition (${status} → ${action})`)
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Bulk failed" },
      { status: 500 }
    )
  }
}