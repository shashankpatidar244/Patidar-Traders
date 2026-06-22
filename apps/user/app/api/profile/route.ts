import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/getUserFromRequest";
import { prisma } from "@repo/database";

export async function GET() {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWithDetails = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        username: true,
        phone: true,
      },
    });

    if (!userWithDetails) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      { 
        name: userWithDetails.username,
        phone: userWithDetails.phone,
      }, 
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
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