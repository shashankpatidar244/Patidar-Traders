"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import InventoryTable from "./InventoryTable";
import SummaryCards from "./SummaryCards";
import BulkActions from "./BulkActions";
import { useInventory } from "../hooks/useInventory";
import Pagination from "../../../components/shared/Pagination";
import SearchFilterBar, {
  FilterField,
} from "../../../components/shared/SearchFilterBar";
export default function InventoryClientPage({
  categories,
  brands,
}: {
  categories: any[];
  brands: any[];
}) {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);

  const [selected, setSelected] = useState<number[]>([]);

  const { data, totalPages, currentLimit, refresh } = useInventory();

  const clearSelection = () => setSelected([]);

  const filterFields: FilterField[] = [
    {
      key: "stock",
      label: "Stock",
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
      key: "unit",
      label: "Unit",
      options: [
        {
          label: "Piece",
          value: "PCS",
        },

        {
          label: "Kg",
          value: "KG",
        },

        {
          label: "Liter",
          value: "L",
        },
      ],
    },

    {
      key: "category",
      label: "Category",
      options: categories.map((cat: any) => ({
        label: cat.name,
        value: String(cat.id),
      })),
    },

    {
      key: "brand",
      label: "Brand",
      options: brands.map((brand: any) => ({
        label: brand.name,
        value: String(brand.id),
      })),
    },

    {
      key: "sort",

      label: "Sort",

      isSortEngine: true,

      options: [
        {
          label: "Newest",
          value: "newest",
        },

        {
          label: "Oldest",
          value: "oldest",
        },
      ],
    },
  ];

  const variants = useMemo(() => {
    return data.flatMap((product: any) =>
      (product.variants || []).map((variant: any) => ({
        ...variant,
        product: {
          name: product.name,
        },
      }))
    );
  }, [data]);

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
          globalSearchPlaceholder="Search by product or variant..."
          fields={filterFields}
        />
      </div>

      <BulkActions
        selected={selected}
        data={variants}
        refresh={refresh}
        clearSelection={clearSelection}
      />

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
