import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

import { PaymentStatus } from "@prisma/client";
import { logAdminAction } from "../../../lib/adminLog";

const allowedActions = ["MARK_PAID", "REFUND", "SET_PENDING", "FAIL"] as const;

type BulkAction = (typeof allowedActions)[number];

interface UndoPayment {
  id: number;
  paymentStatus: PaymentStatus;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      ids,
      action,
      undo,
      previousStatuses,
    }: {
      ids?: number[];
      action?: BulkAction;
      undo?: boolean;
      previousStatuses?: UndoPayment[];
    } = body;

    // UNDO PAYMENT STATUS CHANGES
    if (undo) {
      if (
        !previousStatuses ||
        !Array.isArray(previousStatuses) ||
        previousStatuses.length === 0
      ) {
        return NextResponse.json(
          {
            error: "Missing previous statuses",
          },
          {
            status: 400,
          }
        );
      }

      await prisma.$transaction(
        previousStatuses.map((payment) =>
          prisma.order.update({
            where: {
              id: payment.id,
            },
            data: {
              paymentStatus: payment.paymentStatus,
            },
          })
        )
      );

      return NextResponse.json({
        success: true,
        message: "Undo completed",
      });
    }

    // VALIDATION
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid order ids",
        },
        {
          status: 400,
        }
      );
    }

    if (!action || !allowedActions.includes(action)) {
      return NextResponse.json(
        {
          error: "Invalid action",
        },
        {
          status: 400,
        }
      );
    }

    // ACTION MAPPING
    const statusMap: Record<BulkAction, PaymentStatus> = {
      MARK_PAID: "PAID",
      REFUND: "REFUNDED",
      SET_PENDING: "PENDING",
      FAIL: "FAILED",
    };

    const status = statusMap[action];

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
    });

    // ADMIN LOGS
    await Promise.all(
      ids.map((id: number) =>
        logAdminAction({
          action,
          entity: "ORDER",
          entityId: id,
        })
      )
    );

    return NextResponse.json({
      success: true,

      updated: ids.length,

      status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to bulk update payments",
      },
      {
        status: 500,
      }
    );
  }
}
