import { prisma } from "@repo/database"

export async function logAdminAction({
  action,
  entity,
  entityId,
}: {
  action: string
  entity: string
  entityId: number
}) {
  try {
    await prisma.adminLog.create({
      data: {
        action,
        entity,
        entityId,
      },
    })
  } catch (err) {
    console.error("AdminLog error:", err)
  }
}