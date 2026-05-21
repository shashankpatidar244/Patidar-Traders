"use client";

import { useState } from "react";

import InventoryTable from "./components/InventoryTable";
import InventoryFilters from "./components/InventoryFilters";
import SummaryCards from "./components/SummaryCards";
import BulkActions from "./components/BulkActions";
import ImportInventory from "./components/ImportInventory";
import { useInventory } from "./hooks/useInventory";
import Pagination from "./components/Pagination";

export default function InventoryPage() {
  const [filters, setFilters] = useState({ search: "", status: "" });

  const {
    data,
    page,
    setPage,
    totalPages,
    currentLimit,
    updateLimit,
    refresh,
  } = useInventory(filters);

  const [selected, setSelected] = useState<number[]>([]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
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

      {/* SUMMARY CARDS */}
      <div className="bg-white p-4 rounded-2xl">
        <SummaryCards data={data} />
      </div>

      {/* FILTER + BULK */}
      <div className="bg-white p-4 rounded-2xl flex flex-col gap-4">
        <InventoryFilters setFilters={setFilters} />

        <BulkActions selected={selected} data={data} refresh={refresh} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <InventoryTable
          data={data}
          selected={selected}
          setSelected={setSelected}
          refresh={refresh}
        />
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        totalPages={totalPages}
        currentLimit={currentLimit}
        setPage={setPage}
        updateLimit={updateLimit}
      />
    </div>
  );
}
