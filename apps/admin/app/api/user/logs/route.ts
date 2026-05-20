import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = Number(searchParams.get("userId"))

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    const logs = await prisma.adminLog.findMany({
      where: {
        entity: "USER",
        entityId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(logs)
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    )
  }
}