import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest";
import { addressSchema } from "../../../../app/lib/validators/address";

// GET SINGLE ADDRESS
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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

//UPDATE ADDRESS
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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

  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: {
            userId: user.id,
            NOT: {
              id: Number(id),
            },
          },
          data: {
            isDefault: false,
          },
        });
      }

      const address = await tx.address.findFirst({
        where: {
          id: Number(id),
          userId: user.id,
        },
      });

      if (!address) {
        throw new Error("Address not found");
      }

      await tx.address.update({
        where: {
          id: Number(id),
        },
        data,
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Address update failed",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE ADDRESS

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
