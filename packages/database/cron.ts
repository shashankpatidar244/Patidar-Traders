import "server-only";
import cron from "node-cron";
import { prisma } from "./index";
import {
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";

export function startCronJobs() {
  console.log("🟢 Cron started");

    // TEST
    // "* * * * *"
   
    // PROD
    // "*/10 * * * *"
   
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();

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

      if (!orders.length) {
        console.log("✅ No expired orders");
        return;
      }

      console.log(
        `⚠️ ${orders.length} expired orders found`
      );

      for (const order of orders) {
        await prisma.$transaction(async (tx) => {
          //  IMPORTANT
          //  Prevent double execution

          const latestOrder =
            await tx.order.findUnique({
              where: {
                id: order.id,
              },
            });

          if (
            !latestOrder ||
            latestOrder.status !==
              OrderStatus.PENDING ||
            latestOrder.paymentStatus !==
              PaymentStatus.PENDING
          ) {
            return;
          }

          await tx.order.update({
            where: {
              id: order.id,
            },

            data: {
              status: OrderStatus.CANCELLED,
              paymentStatus:
                PaymentStatus.FAILED,
            },
          });

          //  Restore stock

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

          console.log(
            `❌ Order #${order.id} auto cancelled`
          );
        });
      }
    } catch (error) {
      console.error(
        "❌ Cron Error:",
        error
      );
    }
  });
}