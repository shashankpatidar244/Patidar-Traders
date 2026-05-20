import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest";

export async function POST(req: Request) {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  // Remove old default
  await prisma.address.updateMany({
    where: { userId: user.id },
    data: { isDefault: false },
  });

  // Set new default
  await prisma.address.update({
    where: { id },
    data: { isDefault: true },
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const address = await prisma.address.findFirst({
    where: {
      userId: user.id,
      isDefault: true,
    },
  });

  return NextResponse.json({ address });
}