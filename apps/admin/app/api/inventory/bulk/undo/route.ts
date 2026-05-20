import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    const { previous } = await req.json()

    await Promise.all(
      previous.map((item: any) =>
        prisma.productVariant.update({
          where: { id: item.id },
          data: { stock: item.stock },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Undo failed" },
      { status: 500 }
    )
  }
}