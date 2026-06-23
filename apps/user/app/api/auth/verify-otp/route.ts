import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";

export async function POST(req: Request) {
  try {
    const { phone, otp, type } = await req.json();
    // CHANGE PHONE OTP VERIFY

    if (type === "change-phone") {
      const currentUser = await getUserFromRequest();

      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const dbUser = await prisma.user.findUnique({
        where: {
          id: currentUser.id,
        },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (!dbUser.pendingPhone) {
        return NextResponse.json(
          { error: "No phone change request found" },
          { status: 400 }
        );
      }

      if (dbUser.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      if (dbUser.otpExpiresAt && dbUser.otpExpiresAt < new Date()) {
        return NextResponse.json({ error: "OTP expired" }, { status: 400 });
      }

      /* Final uniqueness check */

      const phoneExists = await prisma.user.findFirst({
        where: {
          phone: dbUser.pendingPhone,
          NOT: {
            id: dbUser.id,
          },
        },
      });

      if (phoneExists) {
        return NextResponse.json(
          { error: "Phone already in use" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          phone: dbUser.pendingPhone,
          pendingPhone: null,
          otp: null,
          otpExpiresAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        redirect: "/dashboard/profile",
      });
    }

    // NORMAL OTP VERIFY

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    /* OTP VERIFIED */

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        otp: null,
        otpExpiresAt: null,
        isVerified: true,
      },
    });

    /* RESET PASSWORD FLOW */

    if (type === "reset") {
      return NextResponse.json({
        success: true,
        redirect: `/reset-password?phone=${phone}`,
      });
    }

    /* EXISTING USER */

    if (updatedUser.password) {
      return NextResponse.json({
        success: true,
        isFirstTime: false,
        redirect: "/signin",
      });
    }

    /* FIRST TIME USER */

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
