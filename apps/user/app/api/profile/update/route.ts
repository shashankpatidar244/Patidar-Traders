import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest"

export async function POST(req: Request) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()

  await prisma.user.update({
    where: { id: user.id },
    data: { username: body.name },
  })

  return NextResponse.json({ success: true })
}