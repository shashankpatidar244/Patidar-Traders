import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../lib/jwt";

const setCredentialsSchema = z.object({
  phone: z.string().min(10),
  username: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = setCredentialsSchema.safeParse(body);

    if (!parsed.success) {
      console.error("ZOD ERROR:", parsed.error);
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    const { phone, username, password } = parsed.data;

    // 🔎 Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: "User already registered" },
        { status: 400 }
      );
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (existingUser) {
      user = await prisma.user.update({
        where: { phone },
        data: {
          username,
          password: hashedPassword,
          isVerified: true,
          role: "USER",
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          phone,
          username,
          password: hashedPassword,
          isVerified: true,
          role: "USER",
        },
      });
    }

    // 🎟 Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    // 🔁 Token rotation
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ),
      },
    });

    const response = NextResponse.json({ success: true });

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
    console.error("SET CREDENTIALS ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}