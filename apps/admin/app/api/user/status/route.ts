import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  const { userId, action } = await req.json()

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  let data: any = {}

  if (action === "BLOCK") data.isBlocked = true
  if (action === "UNBLOCK") data.isBlocked = false
  if (action === "PROMOTE") data.role = "ADMIN"
  if (action === "DEMOTE") data.role = "USER"

    // 🔥 Update user
    await prisma.user.update({
      where: { id: userId },
      data,
    })
  
    // 🔥 LOG ACTION
    await prisma.adminLog.create({
      data: {
        action,
        entity: "USER",
        entityId: userId,
      },
    })

  return NextResponse.json({ success: true })
}
