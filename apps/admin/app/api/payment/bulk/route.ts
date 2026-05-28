import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

import {
  PaymentStatus,
} from "@prisma/client"

import { logAdminAction } from "../../../lib/adminLog"

export async function POST(req: Request) {
  try {
    const { ids, action } = await req.json()

    // VALIDATION
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid order ids",
        },
        {
          status: 400,
        }
      )
    }

    let status: PaymentStatus = "PENDING"

    // ACTION MAPPING
    if (action === "MARK_PAID") {
      status = "PAID"
    }

    if (action === "REFUND") {
      status = "REFUNDED"
    }

    if (action === "FAIL") {
      status = "FAILED"
    }

    if (action === "SET_PENDING") {
      status = "PENDING"
    }

    // UPDATE ORDERS
    await prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },
      },

      data: {
        paymentStatus: status,

        ...(status === "PAID"
          ? {
              paidAt: new Date(),
            }
          : {}),
      },
    })

    // ADMIN LOGS
    await Promise.all(
      ids.map((id: number) =>
        logAdminAction({
          action,
          entity: "ORDER",
          entityId: id,
        })
      )
    )

    return NextResponse.json({
      success: true,

      updated: ids.length,

      status,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Failed to bulk update payments",
      },
      {
        status: 500,
      }
    )
  }
}