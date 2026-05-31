import { prisma } from "@repo/database";

import { NextResponse } from "next/server";
const allowedActions = [
  "CONFIRM",
  "PACK",
  "SHIP",
  "OUT_FOR_DELIVERY",
  "DELIVER",
  "COMPLETE",
  "CANCEL",
];

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

    await prisma.$transaction(
      async (tx) => {
        for (const order of orders) {
          const status = order.status;

          // PENDING → CONFIRMED

          if (action === "CONFIRM" && status === "PENDING") {
            // STOCK CHECK

            await Promise.all(
              order.items.map(async (item) => {
                if (!item.variantId) return;

                const variantId = item.variantId;

                const variant = await tx.productVariant.findUnique({
                  where: {
                    id: variantId,
                  },
                });

                if (!variant || variant.stock < item.quantity) {
                  throw new Error(`Out of stock for Order #${order.id}`);
                }
              })
            );

            // REDUCE STOCK

            await Promise.all(
              order.items.map(async (item) => {
                if (!item.variantId) return;

                const variantId = item.variantId;

                const variant = await tx.productVariant.findUnique({
                  where: {
                    id: variantId,
                  },
                });

                if (!variant) return;

                await tx.productVariant.update({
                  where: {
                    id: variantId,
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
                    variantId: variantId,

                    oldStock: variant.stock,

                    newStock: variant.stock - item.quantity,

                    action: "REDUCE",
                  },
                });
              })
            );

            // UPDATE ORDER

            await tx.order.update({
              where: {
                id: order.id,
              },

              data: {
                status: "CONFIRMED",

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

          // PACKED → SHIPPED
          else if (action === "SHIP" && status === "PACKED") {
            await tx.order.update({
              where: {
                id: order.id,
              },

              data: {
                deliveryStatus: "SHIPPED",
              },
            });
          }

          // SHIPPED → OUT FOR DELIVERY
          else if (
            action === "OUT_FOR_DELIVERY" &&
            status === "PACKED" &&
            order.deliveryStatus === "SHIPPED"
          ) {
            await tx.order.update({
              where: {
                id: order.id,
              },

              data: {
                deliveryStatus: "OUT_FOR_DELIVERY",
              },
            });
          }

          // OUT FOR DELIVERY → DELIVERED
          else if (
            action === "DELIVER" &&
            status === "PACKED" &&
            order.deliveryStatus === "OUT_FOR_DELIVERY"
          ) {
            await tx.order.update({
              where: {
                id: order.id,
              },

              data: {
                deliveryStatus: "DELIVERED",
              },
            });
          }

          // DELIVERED → COMPLETED
          else if (
            action === "COMPLETE" &&
            status === "PACKED" &&
            order.deliveryStatus === "DELIVERED"
          ) {
            await tx.order.update({
              where: {
                id: order.id,
              },

              data: {
                status: "COMPLETED",
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
              await Promise.all(
                order.items.map(async (item) => {
                  if (!item.variantId) return;

                  const variantId = item.variantId;

                  const variant = await tx.productVariant.findUnique({
                    where: {
                      id: variantId,
                    },
                  });

                  if (!variant) return;

                  await tx.productVariant.update({
                    where: {
                      id: variantId,
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
                      variantId: variantId,

                      oldStock: variant.stock,

                      newStock: variant.stock + item.quantity,

                      action: "ADD",
                    },
                  });
                })
              );
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

          else {
            throw new Error(`Invalid transition (${status} → ${action})`);
          }
        }
      },

      {
        timeout: 60000,
        maxWait: 60000,
      }
    );

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
