import { updateStock } from "../../../lib/inventory"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    const { variantIds, action, value } = await req.json()

    if (!variantIds?.length) {
      return NextResponse.json(
        { error: "No variants selected" },
        { status: 400 }
      )
    }

    if (!["ADD", "REDUCE", "SET"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    await Promise.all(
      variantIds.map((id: number) =>
        updateStock({ variantId: id, action, value })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}