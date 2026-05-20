import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const { name } = await req.json();

  const brand = await prisma.brand.create({
    data: { name },
  });

  return NextResponse.json(brand);
}