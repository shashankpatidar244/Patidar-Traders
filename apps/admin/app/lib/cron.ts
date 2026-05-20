import cron from "node-cron"
import { prisma } from "@repo/database"

export function startCronJobs() {
  // ⏰ Runs every hour
  cron.schedule("*/25 * * * *", async () => {
    try {
      console.log("⏳ Running Low Stock Check...")

      const lowStockProducts = await prisma.productVariant.findMany({
        where: {
          stock: { lt: 5 },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (lowStockProducts.length === 0) {
        console.log("✅ No low stock items")
        return
      }

      console.log(`⚠️ Low stock count: ${lowStockProducts.length}`)

      // 🔥 Detailed log
      lowStockProducts.forEach((v) => {
        console.log(
          `🔻 ${v.product.name} | ${v.value} ${v.unit} | Stock: ${v.stock} | Price: ₹${v.sellingPrice ?? v.mrp}`
        )
      })

      // =========================
      // 🔔 OPTIONAL ALERT SYSTEM
      // =========================

      // Example: send notification / email / webhook
      // await sendLowStockAlert(lowStockProducts)

    } catch (error) {
      console.error("❌ CRON ERROR:", error)
    }
  })
}