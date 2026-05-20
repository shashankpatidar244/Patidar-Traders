import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@repo/database"
import { logAdminAction } from "../../../lib/adminLog"

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text() // RAW body needed
    const signature = req.headers.get("x-razorpay-signature") as string

    // ✅ Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(body)
      .digest("hex")

    if (expectedSignature !== signature) {
      console.error("❌ Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    // 🎯 HANDLE EVENTS
    switch (event.event) {
      case "payment.captured":
        await handlePaymentSuccess(event.payload.payment.entity)
        break

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity)
        break

      default:
        console.log("Unhandled event:", event.event)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}

 async function handlePaymentSuccess(payment: any) {
    const razorpayOrderId = payment.order_id
  
    // 1. Update the record
    // We use updateMany to be safe, but we need the internal ID for logging
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId }
    })
  
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID" },
      })
  
      // 2. Log the action
      await logAdminAction({
        action: "WEBHOOK_PAYMENT_SUCCESS",
        entity: "ORDER",
        entityId: order.id,
      })
    }
    
    console.log("✅ Payment captured:", razorpayOrderId)
  }
  
  async function handlePaymentFailed(payment: any) {
    const razorpayOrderId = payment.order_id
  
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId }
    })
  
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      })
  
      await logAdminAction({
        action: "WEBHOOK_PAYMENT_FAILED",
        entity: "ORDER",
        entityId: order.id,
      })
    }
  
    console.log("❌ Payment failed:", razorpayOrderId)
  }
  