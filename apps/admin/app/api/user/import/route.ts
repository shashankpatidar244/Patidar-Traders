import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { users } = await req.json()

    if (!users?.length) {
      return NextResponse.json(
        { error: "No users provided" },
        { status: 400 }
      )
    }

    await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    )
  }
}