import { NextResponse } from "next/server"
import { prisma } from "@repo/database"

export async function GET() {
  const orders = await prisma.order.findMany({ where: { paymentStatus: "PAID" } })
  const users = await prisma.user.findMany()

  const revenueByDay: Record<string, number> = {}
  orders.forEach(o => {
    const day = o.createdAt ? o.createdAt.toISOString().split("T")[0] : null
    if (!day) return
    revenueByDay[day] = (revenueByDay[day] ?? 0) + (o.total ?? 0)
  })

  const topDay = Object.entries(revenueByDay).sort((a, b) => b[1] - a[1])[0]

  return NextResponse.json({ topRevenueDay: topDay?.[0] ?? null, totalUsers: users.length })
}