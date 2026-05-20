import { NextResponse } from "next/server"
import { prisma } from "@repo/database"

export async function GET() {
  const orders = await prisma.order.findMany({ include: { user: true } })

  const csv = [
    ["OrderID", "User", "Total", "Status", "Payment", "Date"],
    ...orders.map(o => [
      o.id,
      o.user?.phone || o.user?.username,
      o.total,
      o.status,
      o.paymentMethod,
      o.createdAt.toISOString(),
    ]),
  ]
    .map(r => r.join(","))
    .join("\n")

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=orders.csv",
    },
  })
}