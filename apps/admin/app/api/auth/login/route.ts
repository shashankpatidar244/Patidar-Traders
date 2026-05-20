import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { generateAccessToken } from "@repo/auth/src/jwt";

const ALLOWED_ADMIN_PHONES = [
  "9999999999",
];

export async function POST(req: Request) {
  const body = await req.json();
  const { phone, password } = body;

  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user || !user.password) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // 🔥 STRICT ADMIN CHECK
  if (
    user.role !== "ADMIN" ||
    !ALLOWED_ADMIN_PHONES.includes(user.phone)
  ) {
    return NextResponse.json(
      { message: "Access denied. Not authorized as Admin." },
      { status: 403 }
    );
  }

  const token = generateAccessToken({
    id: user.id,
    role: user.role,
  });

  const response = NextResponse.json({ success: true });

  response.cookies.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}