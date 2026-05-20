import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest"

export async function GET() {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ count: 0 })
  }

  const count = await prisma.cartItem.count({
    where: { userId: user.id },
  })

  return NextResponse.json({ count })
}