import { prisma } from "@repo/database";
import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "name_asc";

    const Filters: Prisma.UserWhereInput[] = [];

    if (search) {
      Filters.push({
        OR: [
          {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: search,
            },
          },
        ],
      });
    }

    if (role && Object.values(Role).includes(role as Role)) {
      Filters.push({
        role: role as Role,
      });
    }

    if (status === "ACTIVE") {
      Filters.push({ isBlocked: false });
    }

    if (status === "BLOCKED") {
      Filters.push({ isBlocked: true });
    }

    const where: Prisma.UserWhereInput =
      Filters.length > 0 ? { AND: Filters } : {};

    // ================= SORT =================

    let orderBy: Prisma.UserOrderByWithRelationInput[] = [];

    switch (sort) {
      case "newest":
        orderBy = [{ createdAt: "desc" }];
        break;

      case "oldest":
        orderBy = [{ createdAt: "asc" }];
        break;

      case "name_desc":
        orderBy = [{ username: "desc" }];
        break;

      case "name_asc":
      default:
        orderBy = [{ username: "asc" }];
        break;
    }

    // ================= FETCH =================

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,

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
            select: {
              total: true,
              paymentStatus: true,
            },
          },
        },
      }),
      prisma.user.count({
        where,
      }),
    ]);

    // ================= TRANSFORM =================
    const formattedUsers = users.map((u) => {
      const paidOrders = u.orders.filter(
        (o) => o.paymentStatus === "PAID"
      );
    
      const pendingOrders = u.orders.filter(
        (o) => o.paymentStatus === "PENDING"
      );
    
      const refundedOrders = u.orders.filter(
        (o) => o.paymentStatus === "REFUNDED"
      );
    
      const failedOrders = u.orders.filter(
        (o) => o.paymentStatus === "FAILED"
      );
    
      const totalSpend = paidOrders.reduce(
        (sum, o) => sum + Number(o.total),
        0
      );
    
      return {
        id: u.id,
        username: u.username,
        phone: u.phone,
        role: u.role,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt,
    
        totalOrders: u._count.orders,
    
        paidOrders: paidOrders.length,
        pendingOrders: pendingOrders.length,
        refundedOrders: refundedOrders.length,
        failedOrders: failedOrders.length,
    
        totalSpend,
      };
    });

    return NextResponse.json({
      data: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET USERS ERROR:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
