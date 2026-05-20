import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!numericId) {
      return Response.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    await prisma.productVariant.delete({
      where: { id: numericId },
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}


  
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = await req.json();

  const updated = await prisma.productVariant.update({
    where: { id },
    data: {
      stock: body.stock,
    },
  });

  return NextResponse.json(updated);
}