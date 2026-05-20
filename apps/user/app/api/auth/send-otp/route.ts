import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json({ success: false, message: "Phone required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // For now just log OTP (later integrate SMS service)
  console.log("OTP:", otp);

  await prisma.user.upsert({
    where: { phone },
    update: {},
    create: {
      phone,
      isVerified: false,
    },
  });

  // In real app save OTP in DB or Redis

  return NextResponse.json({ success: true });
}