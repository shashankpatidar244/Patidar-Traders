"use client"

import { useState } from "react"
import toast from "react-hot-toast"

export default function StockEditor({
  variantId,
  stock,
  refresh,
  onClose,
}: any) {
  const [value, setValue] = useState(stock)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)

    const res = await fetch("/api/inventory/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId,
        action: "SET",
        value,
      }),
    })

    setLoading(false)

    if (res.ok) {
      toast.success("Stock updated")
      refresh()
      onClose()
    } else {
      toast.error("Failed")
    }
  }

  return (
    <div className="flex items-center gap-2 justify-center">
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-16 text-center border rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={save}
        disabled={loading}
        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "..." : "Save"}
      </button>

      <button
        onClick={onClose}
        className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  )
}