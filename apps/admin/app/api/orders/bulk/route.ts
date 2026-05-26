import { prisma } from "@repo/database";

import { DeliveryStatus, OrderStatus, PaymentStatus } from "@prisma/client";

import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { orderIds, action } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No orders selected",
        },
        {
          status: 400,
        }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        id: {
          in: orderIds.map(Number),
        },
      },

      include: {
        items: true,
      },
    });

    if (!orders.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No matching orders found",
        },
        {
          status: 404,
        }
      );
    }

    // SAME STATUS CHECK

    const firstStatus = orders[0]?.status;

    const allSame = orders.every((o) => o.status === firstStatus);

    if (!allSame) {
      return NextResponse.json(
        {
          success: false,
          error: "Select orders with same status only",
        },
        {
          status: 400,
        }
      );
    }

    // TRANSACTION

    await prisma.$transaction(async (tx) => {
      for (const order of orders) {
        const status = order.status;

        // PENDING → CONFIRMED

        if (action === "CONFIRM" && status === "PENDING") {
          // STOCK CHECK
          for (const item of order.items) {
            if (!item.variantId) continue;

            const variant = await tx.productVariant.findUnique({
              where: {
                id: item.variantId,
              },
            });

            if (!variant || variant.stock < item.quantity) {
              throw new Error(`Out of stock for Order #${order.id}`);
            }
          }

          // REDUCE STOCK
          for (const item of order.items) {
            if (!item.variantId) continue;

            const variant = await tx.productVariant.findUnique({
              where: {
                id: item.variantId,
              },
            });

            if (!variant) continue;

            await tx.productVariant.update({
              where: {
                id: item.variantId,
              },

              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

            // INVENTORY LOG
            await tx.inventoryLog.create({
              data: {
                variantId: item.variantId,

                oldStock: variant.stock,

                newStock: variant.stock - item.quantity,

                action: "REDUCE",
              },
            });
          }

          // UPDATE ORDER
          await tx.order.update({
            where: {
              id: order.id,
            },

            data: {
              status: "CONFIRMED",

              paymentStatus: "PAID",

              paidAt: new Date(),
            },
          });
        }

        // CONFIRMED → PACKED
        else if (action === "PACK" && status === "CONFIRMED") {
          await tx.order.update({
            where: {
              id: order.id,
            },

            data: {
              status: "PACKED",

              deliveryStatus: "PACKED",
            },
          });
        }

        // PACKED → COMPLETED
        else if (action === "COMPLETE" && status === "PACKED") {
          await tx.order.update({
            where: {
              id: order.id,
            },

            data: {
              status: "COMPLETED",

              deliveryStatus: "DELIVERED",
            },
          });
        }

        // CANCEL ORDER
        else if (
          action === "CANCEL" &&
          status !== "COMPLETED" &&
          status !== "CANCELLED"
        ) {
          // RESTORE STOCK
          if (status !== "PENDING") {
            for (const item of order.items) {
              if (!item.variantId) continue;

              const variant = await tx.productVariant.findUnique({
                where: {
                  id: item.variantId,
                },
              });

              if (!variant) continue;

              await tx.productVariant.update({
                where: {
                  id: item.variantId,
                },

                data: {
                  stock: {
                    increment: item.quantity,
                  },
                },
              });

              // INVENTORY LOG
              await tx.inventoryLog.create({
                data: {
                  variantId: item.variantId,

                  oldStock: variant.stock,

                  newStock: variant.stock + item.quantity,

                  action: "ADD",
                },
              });
            }
          }

          // UPDATE ORDER
          await tx.order.update({
            where: {
              id: order.id,
            },

            data: {
              status: "CANCELLED",

              paymentStatus:
                order.paymentStatus === "PAID"
                  ? "REFUNDED"
                  : order.paymentStatus,
            },
          });
        }

        // INVALID FLOW
        else {
          throw new Error(`Invalid transition (${status} → ${action})`);
        }
      }
    });

    // SUCCESS

    return NextResponse.json({
      success: true,
      message: "Bulk action completed",
    });
  } catch (error: any) {
    console.error("BULK ORDER ACTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Bulk update failed",
      },
      {
        status: 500,
      }
    );
  }
}
