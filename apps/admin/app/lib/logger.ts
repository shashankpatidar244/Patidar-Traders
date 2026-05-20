import { prisma } from "@repo/database"

export async function logAction(
  action: string,
  entity: string,
  entityId: number
) {
  await prisma.adminLog.create({
    data: {
      action,
      entity,
      entityId,
    },
  })
}