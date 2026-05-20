"use client"

import { useState } from "react"
import toast, { Toast } from "react-hot-toast"

type Variant = {
  id: number
  stock: number
  mrp?: number
  sellingPrice?: number
  value: string
  unit: string
  product: {
    name: string
  }
}

export default function BulkActions({
  selected,
  data,
  refresh,
}: {
  selected: number[]
  data: Variant[]
  refresh: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(1)

  async function bulk(action: "ADD" | "REDUCE" | "SET") {
    if (!value) return toast.error("Enter value")

    // 🔥 STORE OLD VALUES FOR UNDO
    const previous = data
      .filter((v) => selected.includes(v.id))
      .map((v) => ({
        id: v.id,
        stock: v.stock,
      }))

    setLoading(true)

    try {
      const res = await fetch("/api/inventory/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantIds: selected,
          action,
          value,
        }),
      })

      if (!res.ok) throw new Error()

      refresh()

      // 🔥 UNDO TOAST
      toast(
        (t: Toast) => (
          <div className="flex items-center gap-4">
            <span>Stock updated</span>
      
            <button
              onClick={async () => {
                toast.dismiss(t.id)
      
                await fetch("/api/inventory/bulk/undo", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ previous }),
                })
      
                refresh()
                toast.success("Undo successful")
              }}
              className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 5000 }
      )
    } catch {
      toast.error("Failed")
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    const selectedData = data.filter((v) => selected.includes(v.id))

    const rows = selectedData.map((v) => {
      const discount =
        v.mrp && v.sellingPrice && v.mrp > v.sellingPrice
          ? Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100)
          : 0

      return {
        Product: v.product.name,
        Variant: `${v.value} ${v.unit}`,
        Stock: v.stock,
        MRP: v.mrp ?? 0,
        SellingPrice: v.sellingPrice ?? 0,
        Discount: `${discount}%`,
      }
    })

    const csv =
      "Product,Variant,Stock,MRP,SellingPrice,Discount\n" +
      rows.map((r) => Object.values(r).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "inventory.csv"
    a.click()
  }

  if (!selected.length) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {selected.length} selected
        </span>

        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-20 border rounded-md px-2 py-1 text-center"
        />

        <button
          onClick={() => bulk("ADD")}
          className="px-3 py-1.5 bg-green-100 text-green-700 rounded"
        >
          + Add
        </button>

        <button
          onClick={() => bulk("REDUCE")}
          className="px-3 py-1.5 bg-red-100 text-red-700 rounded"
        >
          - Reduce
        </button>

        <button
          onClick={() => bulk("SET")}
          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded"
        >
          Set
        </button>
      </div>

      <button
        onClick={exportCSV}
        className="px-3 py-1.5 bg-gray-800 text-white rounded"
      >
        Export CSV
      </button>
    </div>
  )
}