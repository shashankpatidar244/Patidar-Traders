import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";
import { updateProfileSchema } from "@/lib/validators/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        username: true,
        phone: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        username: profile.username,
        phone: profile.phone,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Profile GET Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues[0]?.message,
        },
        {
          status: 400,
        }
      );
    }

    const { username, phone } = result.data;

    /* phone uniqueness */

    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
        NOT: {
          id: user.id,
        },
      },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          error: "Phone number already exists",
        },
        {
          status: 400,
        }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        phone: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /* Phone Changed */

    if (currentUser.phone !== phone) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      console.log(`PHONE CHANGE OTP for ${phone}:`, otp);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          pendingPhone: phone,
          otp,
          otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      return NextResponse.json({
        success: true,
        phoneChanged: true,
        phone,
        message: "Phone number change requires OTP verification",
      });
    }

    /* Username Update */

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        username,
      },
    });

    revalidatePath("/dashboard/profile");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile PATCH Error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
