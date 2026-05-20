import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const variantId = Number(searchParams.get("variantId"))

    if (!variantId) {
      return NextResponse.json(
        { error: "Missing variantId" },
        { status: 400 }
      )
    }

    const logs = await prisma.inventoryLog.findMany({
      where: { variantId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        admin: {
          select: { username: true },
        },
      },
    })

    return NextResponse.json(logs)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    )
  }
}