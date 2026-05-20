import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/database";
import { resetPasswordSchema } from "../../../lib/validators/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { phone: parsed.phone },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(parsed.password, 10);

    await prisma.user.update({
      where: { phone: parsed.phone },
      data: { password: hashed },
    });

    // 🔥 Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Reset failed" }, { status: 400 });
  }
}