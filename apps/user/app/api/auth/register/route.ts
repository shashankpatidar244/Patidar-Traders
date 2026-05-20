import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/database";
import { registerSchema } from "../../../lib/validators/auth";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { phone: parsed.phone },
    });

    if (existing) {
      return NextResponse.json({ error: "User exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        phone: parsed.phone,
        username: parsed.username,
        password: hashed,
        role: "USER",
        isVerified: true,
      },
    });

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}