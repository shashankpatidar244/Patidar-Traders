import { NextResponse } from "next/server"
import { prisma } from "@repo/database"

// ✅ TYPE SAFETY
type RowType = {
  variantId: number
  stock: number
}

type ImportResult = {
  variantId: number
  status: "SUCCESS" | "FAILED"
  reason?: string
}

export async function POST(req: Request) {
  try {
    const { rows }: { rows: RowType[] } = await req.json()

    // ❌ no data
    if (!rows || !rows.length) {
      return NextResponse.json(
        { error: "No data provided" },
        { status: 400 }
      )
    }

    const results: ImportResult[] = []

    // 🔥 NO TRANSACTION (fix timeout issue)
    for (const row of rows) {
      try {
        const { variantId, stock } = row

        // 🔍 find variant
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
        })

        if (!variant) {
          results.push({
            variantId,
            status: "FAILED",
            reason: "Variant not found",
          })
          continue
        }

        const oldStock = variant.stock
        const newStock = stock

        // ✅ update stock
        await prisma.productVariant.update({
          where: { id: variantId },
          data: { stock: newStock },
        })

        // ✅ update product active
        await prisma.product.update({
          where: { id: variant.productId },
          data: {
            isActive: newStock > 0,
          },
        })

        // ✅ log history (safe)
        try {
          await prisma.inventoryLog.create({
            data: {
              variantId,
              oldStock,
              newStock,
              action: "SET",
            },
          })
        } catch (logError) {
          console.log("⚠️ Log failed:", logError)
        }

        results.push({
          variantId,
          status: "SUCCESS",
        })
      } catch (err) {
        console.log("❌ Row error:", err)

        results.push({
          variantId: row.variantId,
          status: "FAILED",
          reason: "DB error",
        })
      }
    }

    // ✅ final response
    return NextResponse.json({
      success: true,
      total: rows.length,
      successCount: results.filter(r => r.status === "SUCCESS").length,
      failedCount: results.filter(r => r.status === "FAILED").length,
      results,
    })
  } catch (error) {
    console.error("❌ Import API Error:", error)

    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    )
  }
}