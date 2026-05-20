import { prisma } from "@repo/database"

export function getStockStatus(stock: number) {
    if (stock === 0) return "OUT"
    if (stock < 5) return "LOW"
    if (stock < 10) return "MEDIUM"
    return "GOOD"
  }


  export async function updateStock({
    variantId,
    action,
    value,
  }: {
    variantId: number
    action: "ADD" | "REDUCE" | "SET"
    value: number
  }) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    })
  
    if (!variant) throw new Error("Variant not found")
  
    let newStock = variant.stock
  
    if (action === "ADD") newStock += value
    if (action === "REDUCE") newStock = Math.max(0, newStock - value)
    if (action === "SET") newStock = value
  
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    })
  
    // 🔥 LOG ENTRY
    await prisma.inventoryLog.create({
      data: {
        variantId,
        oldStock: variant.stock,
        newStock,
        action,
      },
    })
  
    return newStock
  }