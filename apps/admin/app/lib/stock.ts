import { prisma } from "@repo/database"

export async function updateStock(variantId: number, quantity: number) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      stock: {
        decrement: quantity,
      },
    },
  })
}