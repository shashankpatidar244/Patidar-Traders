import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest";

export async function GET(req: Request) {
  const user = await getUserFromRequest();

  if (!user) {
    return NextResponse.json({
      quantity: 0,
    });
  }

  const { searchParams } = new URL(req.url);

  const variantId = Number(
    searchParams.get("variantId")
  );

  const item = await prisma.cartItem.findFirst({
    where: {
      userId: user.id,
      variantId,
    },
  });

  return NextResponse.json({
    quantity: item?.quantity ?? 0,
  });
}