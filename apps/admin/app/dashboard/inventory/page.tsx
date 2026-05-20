"use client"

import { useState } from "react"

import InventoryTable from "./components/InventoryTable"
import InventoryFilters from "./components/InventoryFilters"
import SummaryCards from "./components/SummaryCards"
import BulkActions from "./components/BulkActions"
import ImportInventory from "./components/ImportInventory"
import { useInventory } from "./hooks/useInventory"

export default function InventoryPage() {
  const [filters, setFilters] = useState({ search: "", status: "" })

  const { data, page, setPage, totalPages, refresh } =
    useInventory(filters)

  const [selected, setSelected] = useState<number[]>([])

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* 🔥 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage stock, bulk updates, and imports
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <ImportInventory refresh={refresh} />
        </div>
      </div>

      {/* 📊 SUMMARY CARDS */}
      <div className="bg-white p-4 rounded-2xl">
        <SummaryCards data={data} />
      </div>

      {/* 🔍 FILTER + BULK */}
      <div className="bg-white p-4 rounded-2xl flex flex-col gap-4">

        <InventoryFilters setFilters={setFilters} />

        <BulkActions
          selected={selected}
          data={data}
          refresh={refresh}
        />

      </div>

      {/* 📦 TABLE */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <InventoryTable
          data={data}
          selected={selected}
          setSelected={setSelected}
          refresh={refresh}
        />
      </div>

      {/* 🔢 PAGINATION */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border">

        <span className="text-sm text-gray-500">
          Page <span className="font-semibold text-gray-800">{page}</span>
          {totalPages && ` of ${totalPages}`}
        </span>

        <div className="flex items-center gap-2">

          {/* PREV */}
          <button
            onClick={() => setPage((p: number) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-1.5 text-sm border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
          >
            ← Prev
          </button>

          {/* NEXT */}
          <button
            onClick={() =>
              setPage((p: number) =>
                totalPages ? Math.min(totalPages, p + 1) : p + 1
              )
            }
            disabled={totalPages ? page === totalPages : false}
            className="px-4 py-1.5 text-sm border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
          >
            Next →
          </button>

        </div>
      </div>
    </div>
  )
}