import { prisma } from "@repo/database"

export async function getAdvancedMetrics() {
  // Average Order Value (AOV)
  const aov = await prisma.order.aggregate({
    _avg: { total: true },
    where: { paymentStatus: "PAID" },
  })

  // Conversion Rate (orders / total visits)
  const totalVisits = 1000 // replace with actual analytics table
  const totalOrders = await prisma.order.count({ where: { paymentStatus: "PAID" } })

  return {
    aov: aov._avg.total ?? 0,
    conversionRate: totalOrders / totalVisits,
  }
}