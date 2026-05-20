import { updateStock } from "../../../lib/inventory"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const result = await updateStock(body)

    return NextResponse.json(result)
  } catch (err: any) {

    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}