"use client"

import { useState } from "react"

export default function InventoryFilters({ setFilters }: any) {
  const [local, setLocal] = useState({
    search: "",
    status: "",
  })

  function update(key: string, value: string) {
    const updated = { ...local, [key]: value }
    setLocal(updated)
    setFilters((p: any) => ({ ...p, ...updated }))
  }

  function clearFilters() {
    const reset = { search: "", status: "" }
    setLocal(reset)
    setFilters((p: any) => ({ ...p, ...reset }))
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">

      {/* 🔍 SEARCH */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Search</label>
        <input
          value={local.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Product or variant..."
          className="border px-3 py-2 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 📦 STATUS */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Stock Status</label>
        <select
          value={local.status}
          onChange={(e) => update("status", e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All</option>
          <option value="IN">In Stock</option>
          <option value="LOW">Low Stock</option>
          <option value="OUT">Out of Stock</option>
        </select>
      </div>

      {/* ❌ CLEAR */}
      <div className="flex items-end">
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  )
}