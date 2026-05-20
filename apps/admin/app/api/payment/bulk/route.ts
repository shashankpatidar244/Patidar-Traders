import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { ids, action } = await req.json()

  let status = "PENDING"

  if (action === "MARK_PAID") status = "PAID"
  if (action === "REFUND") status = "REFUNDED"

  await prisma.order.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      paymentStatus: status,
    },
  })

  return NextResponse.json({ success: true })
}