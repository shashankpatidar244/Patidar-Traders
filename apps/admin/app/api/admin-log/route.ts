import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET() {
  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ data: logs })
}