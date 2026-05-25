"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import InventoryTable from "./components/InventoryTable";
import SummaryCards from "./components/SummaryCards";
import BulkActions from "./components/BulkActions";
import { useInventory } from "./hooks/useInventory";
import Pagination from "../components/Pagination";
import SearchFilterBar, { FilterField } from "../components/SearchFilterBar";

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const limit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";

  const status = searchParams.get("status") || "";

  const sort = searchParams.get("sort") || "name_asc";

  const [selected, setSelected] = useState<number[]>([]);

  const { data, totalPages, currentLimit, refresh } = useInventory();
  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Stock Status",

      options: [
        {
          label: "In Stock",
          value: "IN",
        },

        {
          label: "Low Stock",
          value: "LOW",
        },

        {
          label: "Out of Stock",
          value: "OUT",
        },
      ],
    },

    {
      key: "sort",

      label: "Sort",

      isSortEngine: true,

      options: [
        {
          label: "Name A-Z",
          value: "name_asc",
        },

        {
          label: "Name Z-A",
          value: "name_desc",
        },
      ],
    },
  ];

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
      </div>

      {/* SUMMARY CARDS */}
      <div className="bg-white p-4 rounded-2xl">
        <SummaryCards data={data} />
      </div>

      {/* FILTER + BULK */}
      <div className="bg-white p-4 rounded-2xl flex flex-col gap-4">
        <SearchFilterBar
          globalSearchKey="search"
          globalSearchPlaceholder="Search products..."
          fields={filterFields}
        />
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
        title="Inventory"
        page={page}
        totalPages={totalPages}
        currentLimit={currentLimit}
      />
    </div>
  );
}
