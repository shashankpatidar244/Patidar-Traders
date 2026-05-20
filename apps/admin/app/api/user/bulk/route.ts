import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    const { userIds, action } = await req.json()

    if (!userIds?.length) {
      return NextResponse.json(
        { error: "No users selected" },
        { status: 400 }
      )
    }

    let data: any = {}

    if (action === "BLOCK") data.isBlocked = true
    if (action === "UNBLOCK") data.isBlocked = false

    if (!data) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    await prisma.user.updateMany({
      where: {
        id: { in: userIds },
        role: { not: "ADMIN" }, // 🔒 protect admins
      },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}