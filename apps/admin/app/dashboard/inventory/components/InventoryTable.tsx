"use client"

import { useState, useEffect } from "react"
import ProductRow from "./ProductRow"
import InventoryHistory from "./InventoryHistory"

export default function InventoryTable({
  data,
  selected,
  setSelected,
}: any) {

  // 🔥 LOCAL STATE (REAL-TIME UI)
  const [rows, setRows] = useState(data)
  const [open, setOpen] = useState<{ [key: number]: boolean }>({})
  const [historyId, setHistoryId] = useState<number | null>(null)

  useEffect(() => {
    setRows(data)
  }, [data])

  // 🔥 GLOBAL STOCK UPDATE (OPTIMISTIC)
  function updateLocalStock(id: number, action: string, value: number) {
    setRows((prev: any[]) =>
      prev.map((item) => {
        if (item.id !== id) return item

        let newStock = item.stock

        if (action === "ADD") newStock += value
        if (action === "REDUCE") newStock = Math.max(0, newStock - value)
        if (action === "SET") newStock = value

        return {
          ...item,
          stock: newStock,
          updatedAt: new Date().toISOString(),
        }
      })
    )
  }

  // 🔥 GROUP BY PRODUCT (IMPORTANT: use rows not data)
  const grouped = Object.values(
    rows.reduce((acc: any, item: any) => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          product: item.product,
          variants: [],
        }
      }
      acc[item.productId].variants.push(item)
      return acc
    }, {})
  )

  function toggle(id: number) {
    setOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

      {/* 🔷 PRODUCT LIST */}
      {grouped.map((group: any) => (
        <ProductRow
          key={group.product.id}
          group={group}
          open={open[group.product.id]}
          toggle={() => toggle(group.product.id)}
          selected={selected}
          setSelected={setSelected}
          updateLocalStock={updateLocalStock}
          onHistory={setHistoryId} // ✅ FIX
        />
      ))}

      {/* 🔥 GLOBAL HISTORY MODAL (ONLY ONCE) */}
      {historyId && (
        <InventoryHistory
          variantId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}

    </div>
  )
}