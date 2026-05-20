import "server-only";
import cron from "node-cron";
import { prisma } from "./index";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export function startCronJobs() {
  console.log("🟢 Cron started");

  // ==================================================
  // AUTO CANCEL EXPIRED UNPAID ORDERS
  // ==================================================
  // TESTING:
  // "* * * * *"  => every 1 minute
  //
  // PRODUCTION:
  // "*/5 * * * *" => every 5 minutes
  // ==================================================

  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();

      // ==========================================
      // FIND EXPIRED ORDERS
      // ==========================================

      const orders = await prisma.order.findMany({
        where: {
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,

          expiresAt: {
            not: null,
            lt: now,
          },
        },

        include: {
          items: true,
        },
      });

      // ==========================================
      // NOTHING FOUND
      // ==========================================

      if (!orders.length) {
        console.log("✅ No expired orders");
        return;
      }

      console.log(`⚠️ ${orders.length} expired orders found`);

      // ==========================================
      // CANCEL ORDERS
      // ==========================================

      for (const order of orders) {
        await prisma.$transaction(async (tx) => {
          // ==============================
          // CANCEL ORDER
          // ==============================

          await tx.order.update({
            where: {
              id: order.id,
            },

            data: {
              status: OrderStatus.CANCELLED,
              paymentStatus: PaymentStatus.FAILED
            },
          });

          // ==============================
          // RESTORE STOCK
          // ==============================

          for (const item of order.items) {
            if (!item.variantId) continue;

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
          }
        });

        console.log(`❌ Order #${order.id} auto cancelled`);
      }
    } catch (error) {
      console.error("❌ Cron Error:", error);
    }
  });
}