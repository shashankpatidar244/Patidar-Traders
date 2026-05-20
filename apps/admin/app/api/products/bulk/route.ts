import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ids, action } = body

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    let data: any = {}

    if (action === "activate") data.isActive = true
    if (action === "deactivate") data.isActive = false
    if (action === "delete") data.isActive = false // soft delete

    await prisma.product.updateMany({
      where: {
        id: { in: ids },
      },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Bulk failed" }, { status: 500 })
  }
}