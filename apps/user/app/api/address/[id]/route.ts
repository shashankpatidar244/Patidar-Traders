import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest";
import { addressSchema } from "../../../../app/lib/validators/address";

// ========================
// ✅ GET SINGLE ADDRESS
// ========================
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // FIX HERE

  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const address = await prisma.address.findFirst({
    where: {
      id: Number(id),
      userId: user.id,
    },
  });

  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json(address);
}

// ========================
// ✅ UPDATE ADDRESS
// ========================
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; //FIX HERE

  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message,
      },
      {
        status: 400,
      }
    );
  }

  const updated = await prisma.address.updateMany({
    where: {
      id: Number(id),
      userId: user.id,
    },
    data: parsed.data,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// ========================
// ✅ DELETE ADDRESS
// ========================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 🔥 FIX HERE

  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.address.deleteMany({
    where: {
      id: Number(id),
      userId: user.id,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
