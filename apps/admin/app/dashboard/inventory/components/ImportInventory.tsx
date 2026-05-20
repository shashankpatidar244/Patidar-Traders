"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import toast from "react-hot-toast"

type RowType = {
  variantId: number
  stock: number
}

// 🔥 normalize headers (handles Excel issues)
function normalizeKey(key: string) {
  return key.toLowerCase().replace(/\s+/g, "")
}

// 🔽 SAMPLE CSV DOWNLOAD
function downloadSampleCSV() {
  const csv = `variantId,stock
1,50
2,0`

  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "sample_inventory.csv"
  a.click()

  URL.revokeObjectURL(url)
}

export default function ImportInventory({
  refresh,
}: {
  refresh: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)

      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        toast.error("No sheet found")
        return
      }

      const sheet = workbook.Sheets[sheetName]
      if (!sheet) {
        toast.error("Invalid sheet")
        return
      }

      const json: any[] = XLSX.utils.sheet_to_json(sheet)

      if (!json.length) {
        toast.error("File is empty")
        return
      }

      const rows: RowType[] = []
      const invalidRows: any[] = []

      for (const item of json) {
        const raw = item as Record<string, any>

        // ✅ normalize keys
        const row: Record<string, any> = {}
        for (const key in raw) {
          row[normalizeKey(key)] = raw[key]
        }

        const variantId = Number(
          row["variantid"] ?? row["id"]
        )

        const stock = Number(
          row["stock"] ?? row["qty"] ?? row["quantity"]
        )

        if (isNaN(variantId) || isNaN(stock)) {
          console.log("❌ Invalid row:", raw)
          invalidRows.push(raw)
          continue // ✅ skip instead of stopping
        }

        rows.push({ variantId, stock })
      }

      if (!rows.length) {
        toast.error("No valid rows found ❌")
        return
      }

      console.log("✅ Valid rows:", rows)

      const res = await fetch("/api/inventory/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows }),
      })

      const dataRes = await res.json()

      if (!res.ok) {
        console.error("❌ API Error:", dataRes)
        toast.error(dataRes.error || "Import failed")
        return
      }

      // ✅ SUCCESS SUMMARY
      toast.success(
        `Imported: ${dataRes.successCount} ✅ | Failed: ${dataRes.failedCount} ❌`
      )

      // ⚠️ show invalid rows count
      if (invalidRows.length) {
        toast.error(`${invalidRows.length} invalid rows skipped`)
      }

      await refresh()
    } catch (err) {
      console.error(err)
      toast.error("Import failed ❌")
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="flex items-center gap-3">

      {/* 🔽 DOWNLOAD SAMPLE */}
      <button
        onClick={downloadSampleCSV}
        className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300"
      >
        Download Sample
      </button>

      {/* 📤 IMPORT BUTTON */}
      <label className="px-4 py-2 bg-gray-800 text-white rounded cursor-pointer hover:bg-black text-sm">
        {loading ? "Uploading..." : "Import CSV / Excel"}

        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleFile}
          hidden
        />
      </label>
    </div>
  )
}