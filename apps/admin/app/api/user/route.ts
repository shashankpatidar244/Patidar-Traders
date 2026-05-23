import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role")
    const status = searchParams.get("status")

    // ================= WHERE =================
    const where: any = {
      AND: [
        {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        },
      ],
    }

    if (role) where.AND.push({ role })
    if (status === "ACTIVE") where.AND.push({ isBlocked: false })
    if (status === "BLOCKED") where.AND.push({ isBlocked: true })

    // ================= FETCH =================

    const [users, total]  = await Promise.all([prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { username: "asc" }, 
        { id: "asc" },       
      ],

      select: {
        id: true,
        username: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,

        _count: {
          select: { orders: true },
        },

        orders: {
          select: { total: true },
        },
      },
    }),
    prisma.user.count({
      where,
    }),
  ]);

    // ================= TRANSFORM =================
    const formattedUsers = users.map((u) => {
      const totalSpend = u.orders.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0
      )

      return {
        id: u.id,
        username: u.username,
        phone: u.phone,
        role: u.role,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt,

        totalOrders: u._count.orders,
        totalSpend,
      }
    })

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error(
      "GET USERS ERROR:",
      err
      );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}