import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest"

// ========================
// ✅ GET SINGLE ADDRESS
// ========================
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params  // FIX HERE

  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const address = await prisma.address.findFirst({
    where: {
      id: Number(id),
      userId: user.id,
    },
  })

  if (!address) {
    return NextResponse.json(
      { error: "Address not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(address)
}

// ========================
// ✅ UPDATE ADDRESS
// ========================
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params  //FIX HERE

  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const updated = await prisma.address.updateMany({
    where: {
      id: Number(id),
      userId: user.id,
    },
    data: body,
  })

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Address not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}

// ========================
// ✅ DELETE ADDRESS
// ========================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params  // 🔥 FIX HERE

  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const deleted = await prisma.address.deleteMany({
    where: {
      id: Number(id),
      userId: user.id,
    },
  })

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: "Address not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}