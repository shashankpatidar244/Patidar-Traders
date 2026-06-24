import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest";
import bcrypt from "bcrypt";
import { changePasswordApiSchema } from "../../../lib/validators/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body once
    const body = await req.json();

    const parsed = changePasswordApiSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues.at(0)?.message;

      return NextResponse.json(
        {
          error: firstError ?? "Invalid request data",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Prevent same password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error: "New password must be different from current password",
        },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      dbUser.password ?? ""
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
