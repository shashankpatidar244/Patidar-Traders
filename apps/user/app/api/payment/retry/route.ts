import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PaymentStatus, PaymentMethod } from "@prisma/client";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    throw new Error("Razorpay configuration missing");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
}

export async function POST(req: Request) {
  try {
    // AUTHENTICATION
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const orderId = Number(body.orderId);

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Invalid order id",
        },
        { status: 400 }
      );
    }

    // FETCH ORDER

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // OWNERSHIP VALIDATION

    if (order.userId !== user.id) {
      return NextResponse.json(
        {
          error: "Access denied",
        },
        { status: 403 }
      );
    }

    // ONLY ONLINE ORDERS CAN RETRY

    if (order.paymentMethod === PaymentMethod.COD) {
      return NextResponse.json(
        {
          error: "COD orders cannot be retried",
        },
        { status: 400 }
      );
    }

    // DUPLICATE PAYMENT PROTECTION

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json(
        {
          error: "Order already paid",
        },
        { status: 400 }
      );
    }

    // CANCELLED ORDER PROTECTION
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        {
          error: "Order cancelled",
        },
        { status: 400 }
      );
    }

    // PAYMENT EXPIRY VALIDATION

    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          error: "Payment session expired. Please place a new order.",
        },
        { status: 400 }
      );
    }

    // STOCK VALIDATION
    for (const item of order.items) {
      if (!item.variant) {
        return NextResponse.json(
          {
            error: `${item.product.name} variant not found`,
          },
          { status: 400 }
        );
      }

      if (!item.product.isActive) {
        return NextResponse.json(
          {
            error: `${item.product.name} is unavailable`,
          },
          { status: 400 }
        );
      }

      if (item.variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `${item.product.name} is now out of stock`,
          },
          { status: 400 }
        );
      }
    }

    // CREATE NEW RAZORPAY ORDER

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total) * 100),

      currency: "INR",

      receipt: `retry_${order.id}_${Date.now()}`,

      notes: {
        orderId: String(order.id),
        userId: String(user.id),
      },
    });

    // SAVE NEW RAZORPAY ORDER ID

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      success: true,

      orderId: order.id,

      razorpayOrderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      expiresAt: order.expiresAt,

      key: process.env.RAZORPAY_KEY,
    });
  } catch (error: any) {
    console.error("Retry Payment Error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to retry payment",
      },
      { status: 500 }
    );
  }
}
