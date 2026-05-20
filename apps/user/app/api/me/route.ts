import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAccessToken } from "../../lib/jwt";

export async function GET(req: Request) {
  try {
    const accessToken =
      req.headers.get("cookie")
        ?.split("; ")
        .find((c) => c.startsWith("accessToken="))
        ?.split("=")[1];

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}