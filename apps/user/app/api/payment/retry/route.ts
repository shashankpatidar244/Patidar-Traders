import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY!,
    key_secret: process.env.RAZORPAY_SECRET!,
  });
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prevent retry if already paid
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    // Prevent retry if cancelled
    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Order cancelled" }, { status: 400 });
    }

    // Prevent retry if expires
    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Payment session expired" },
        { status: 400 }
      );
    }

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total) * 100),
      currency: "INR",
      receipt: `retry_${order.id}_${Date.now()}`,
    });

    // update new razorpay order id
    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      key: process.env.RAZORPAY_KEY,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
