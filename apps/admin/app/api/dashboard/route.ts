import { NextResponse } from "next/server"
import { prisma } from "@repo/database"

const getDaysAgo = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const range = Number(searchParams.get("range") || 7)
    const startDate = getDaysAgo(range)
    const prevStart = getDaysAgo(range * 2)

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: prevStart } },
      select: { createdAt: true, total: true, paymentStatus: true, status: true, paymentMethod: true },
    })

    let revenue = 0
    let prevRevenue = 0
    let totalOrders = 0
    let pendingOrders = 0
    let cancelledOrders = 0
    let codCount = 0
    let onlineCount = 0

    const revenueMap: Record<string, number> = {}
    const ordersMap: Record<string, number> = {}

    orders.forEach(o => {
      const day = o.createdAt ? o.createdAt.toISOString().split("T")[0] : null
      if (!day) return

      ordersMap[day] = (ordersMap[day] ?? 0) + 1
      totalOrders++

      if (o.status === "PENDING") pendingOrders++
      if (o.status === "CANCELLED") cancelledOrders++
      if (o.paymentMethod === "COD") codCount++
      else onlineCount++

      if (o.paymentStatus === "PAID") {
        if (o.createdAt >= startDate) revenue += o.total ?? 0
        else prevRevenue += o.total ?? 0

        revenueMap[day] = (revenueMap[day] ?? 0) + (o.total ?? 0)
      }
    })

    const growth = prevRevenue === 0 ? 100 : ((revenue - prevRevenue) / prevRevenue) * 100

    const revenueChart = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }))
    const ordersChart = Object.keys(ordersMap).map(date => ({ date, orders: ordersMap[date] }))

    const [
      totalUsers,
      totalProducts,
      lowStock,
      outOfStock,
      newUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.productVariant.count({ where: { stock: { lt: 5 } } }),
      prisma.productVariant.count({ where: { stock: 0 } }),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    ])

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, total: true, status: true, paymentMethod: true, createdAt: true, user: { select: { phone: true, username: true } } },
    })

    const adminLogs = await prisma.adminLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      revenue,
      growth,
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts,
      lowStock,
      cancelledOrders,
      codCount,
      onlineCount,
      outOfStock,
      newUsers,
      revenueChart,
      ordersChart,
      recentOrders,
      adminLogs,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Dashboard error" }, { status: 500 })
  }
}