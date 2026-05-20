import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { currentPassword, newPassword } = await req.json()

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (!dbUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  const isValid = await bcrypt.compare(
    currentPassword,
    dbUser.password?? ""
  )

  if (!isValid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  return NextResponse.json({ success: true })
}