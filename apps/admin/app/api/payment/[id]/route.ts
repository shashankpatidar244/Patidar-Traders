import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: any) {
  const payment = await prisma.order.findUnique({
    where: { id: Number(params.id) },
    include: {
      user: true,
      items: true,
    },
  })

  return NextResponse.json(payment)
}