import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { logAdminAction } from "../../lib/adminLog"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const method = searchParams.get("method")

    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)

    const skip = (page - 1) * limit

    const isNumber = search && !isNaN(Number(search))

    const where: any = {
      ...(search
        ? {
            OR: [
              ...(isNumber ? [{ id: Number(search) }] : []),
              {
                razorpayOrderId: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(status && { paymentStatus: status }),
      ...(method && { paymentMethod: method }),
    }

    // Transaction for performance
    const [payments, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),

      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}



export async function POST(req: Request) {
  const { id, action } = await req.json()

  let status = "PENDING"

  if (action === "MARK_PAID") status = "PAID"
  if (action === "FAIL") status = "FAILED"
  if (action === "REFUND") status = "REFUNDED"
  if (action === "SET_PENDING") status = "PENDING"

  await prisma.order.update({
    where: { id },
    data: { paymentStatus: status },
  })

  // ✅ LOG ACTION
  await logAdminAction({
    action: action,
    entity: "ORDER",
    entityId: id,
  })

  return NextResponse.json({ success: true })
}