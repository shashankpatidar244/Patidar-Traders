import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/database";
import { z } from "zod";
import { generateAccessToken, generateRefreshToken } from "../../../lib/jwt";

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    // Parse form data from HTML form submission
    const formData = await req.formData();
    const phone = formData.get("phone")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    const parsed = loginSchema.parse({ phone, password });

    const user = await prisma.user.findUnique({
      where: { phone: parsed.phone },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken(user.id);

    // Remove previous refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });

    // ✅ Absolute URL redirect (Edge-safe)
    const url = new URL("/dashboard", req.url);
    const response = NextResponse.redirect(url);

    // Set cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ error: "Invalid login data" }, { status: 400 });
  }
}