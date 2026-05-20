"use client"

import { useState } from "react"
import StockBadge from "./StockBadge"
import toast from "react-hot-toast"

export default function VariantRow({
  variant,
  selected,
  setSelected,
  updateLocalStock,
  onHistory,
}: any) {

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(variant.stock)
  const [loading, setLoading] = useState(false)

  function toggleSelect(e: any) {
    e.stopPropagation()
    setSelected((prev: number[]) =>
      prev.includes(variant.id)
        ? prev.filter((id) => id !== variant.id)
        : [...prev, variant.id]
    )
  }

  async function handleUpdate(action: "ADD" | "REDUCE" | "SET", val: number) {
    const oldStock = variant.stock

    updateLocalStock(variant.id, action, val)
    setLoading(true)

    try {
      const res = await fetch("/api/inventory/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          action,
          value: val,
        }),
      })

      if (!res.ok) throw new Error("Failed")

      toast.success(
        action === "ADD"
          ? "Stock increased"
          : action === "REDUCE"
          ? "Stock reduced"
          : "Stock updated"
      )
    } catch {
      updateLocalStock(variant.id, "SET", oldStock)
      toast.error("Update failed")
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date: string) {
    const d = new Date(date)
    return {
      day: d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  const date = formatDate(variant.updatedAt)

  const mrp = variant.mrp
  const selling = variant.sellingPrice

  const discount =
    mrp && selling && mrp > selling
      ? Math.round(((mrp - selling) / mrp) * 100)
      : 0

  return (
    <div className="grid grid-cols-[50px_80px_2fr_1.3fr_1fr_1.2fr_1.4fr_1.5fr] items-center px-6 py-3 border-t bg-white hover:bg-gray-50 transition">

      {/* CHECKBOX */}
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={selected.includes(variant.id)}
          onChange={toggleSelect}
          className="w-4 h-4 accent-black"
        />
      </div>

      {/* ID */}
      <div className="text-xs text-gray-400 font-mono text-center">
        #{variant.id}
      </div>

      {/* VARIANT */}
      <div className="font-medium text-gray-800">
        {variant.value} {variant.unit}
      </div>

      {/* PRICE */}
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-gray-900">
          ₹{selling || mrp}
        </span>

        {discount > 0 && (
          <>
            <span className="text-xs text-gray-400 line-through">
              ₹{mrp}
            </span>
            <span className="text-xs text-green-600">
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      {/* STOCK */}
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            type="number"
            value={value}
            autoFocus
            onChange={(e) => setValue(Number(e.target.value))}
            onBlur={() => {
              setEditing(false)
              handleUpdate("SET", value)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditing(false)
                handleUpdate("SET", value)
              }
            }}
            className="w-16 border px-2 py-1 rounded text-center focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="font-bold px-2 py-1 rounded hover:bg-gray-200"
          >
            {variant.stock}
          </button>
        )}

        {loading && (
          <span className="text-xs text-gray-400 animate-pulse">
            ...
          </span>
        )}
      </div>

      {/* STATUS */}
      <div>
        <StockBadge stock={variant.stock} />
      </div>

      {/* DATE */}
      <div className="text-xs leading-tight">
        <div className="font-medium text-gray-700">{date.day}</div>
        <div className="text-gray-400">{date.time}</div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pr-2 text-sm">
        <button
          onClick={() => handleUpdate("ADD", 1)}
          className="text-green-600 hover:underline"
        >
          +1
        </button>

        <button
          onClick={() => handleUpdate("REDUCE", 1)}
          className="text-red-600 hover:underline"
        >
          -1
        </button>

        <button
          onClick={() => onHistory?.(variant.id)}
          className="text-gray-700 hover:underline"
        >
          History
        </button>
      </div>
    </div>
  )
}