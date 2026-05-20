import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, otp, type } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP required" },
        { status: 400 }
      );
    }

    // DEV MODE: Accept any OTP
    console.log("TYPE RECEIVED:", type);
    if (type === "reset") {
      return NextResponse.json({
        success: true,
        redirect: `/reset-password?phone=${phone}`,
      });
    }

    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // 🆕 If no user → create first-time user
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          isVerified: true,
        },
      });

      return NextResponse.json({
        success: true,
        isFirstTime: true,
        redirect: `/set-credentials?phone=${phone}`,
      });
    }

    // 🔁 If user already has password → old user
    if (user.password) {
      return NextResponse.json({
        success: true,
        isFirstTime: false,
        redirect: "/signin",
      });
    }

    // 👤 User exists but no password
    return NextResponse.json({
      success: true,
      isFirstTime: true,
      redirect: `/set-credentials?phone=${phone}`,
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    );
  }
}