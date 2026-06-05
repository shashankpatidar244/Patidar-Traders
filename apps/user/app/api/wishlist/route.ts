import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/getUserFromRequest";

export async function POST(req: Request) {
  const user = await getUserFromRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, variantId } = await req.json();

  const existing = await prisma.wishlistItem.findFirst({
    where: {
      userId: user.id,
      productId,
      variantId,
    },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      alreadyExists: true,
    });
  }

  await prisma.wishlistItem.create({
    data: {
      userId: user.id,
      productId,
      variantId,
    },
  });

  return NextResponse.json({
    success: true,
  });
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // From Wishlist page
  if (body.id) {
    await prisma.wishlistItem.delete({
      where: {
        id: body.id,
      },
    });

    return NextResponse.json({ success: true });
  }

  // From Product Card Heart button
  if (body.productId && body.variantId) {
    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId: body.productId,
        variantId: body.variantId,
      },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function GET(req: Request) {
  const user = await getUserFromRequest();

  if (!user) {
    return NextResponse.json({ exists: false });
  }

  const { searchParams } = new URL(req.url);

  const productId = searchParams.get("productId");
  const variantId = searchParams.get("variantId");

  // Used by ProductCard
  if (productId && variantId) {
    const exists = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productId: Number(productId),
        variantId: Number(variantId),
      },
    });

    return NextResponse.json({
      exists: !!exists,
    });
  }

  // Wishlist page
  const wishlist = await prisma.wishlistItem.findMany({
    where: {
      userId: user.id,
    },
    include: {
      product: {
        include: {
          images: true,
        },
      },
      variant: true,
    },
  });

  return NextResponse.json(wishlist);
}
