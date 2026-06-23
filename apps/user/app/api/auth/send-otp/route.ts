import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone required",
        },
        {
          status: 400,
        }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000 // 5 min
    );

    // For now just log OTP (later integrate SMS service)
    console.log("OTP:", otp);

    const existingUser = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (existingUser) {
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          otp,
          otpExpiresAt,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          phone,
          isVerified: false,
          otp,
          otpExpiresAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP",
      },
      {
        status: 500,
      }
    );
  }
}
