"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BrandTable from "./components/BrandTable";
import BrandForm from "./components/BrandForm";
import DeleteModal from "./components/DeleteModal";
import Pagination from "../../components/shared/Pagination";
import SearchFilterBar, {
  FilterField,
} from "../../components/shared/SearchFilterBar";

export interface Brand {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

interface ApiResponse {
  data: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BrandPage() {
  
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);

  const limit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";

  const sort = searchParams.get("sort") || "newest";

  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(true);

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [openForm, setOpenForm] = useState(false);

  const [editData, setEditData] = useState<Brand | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ================= FILTERS =================

  const filterFields: FilterField[] = useMemo(
    () => [
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
  
          {
            label: "Most Products",
            value: "most",
          },
  
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
    ],
    []
  );

  // ================= FETCH =================

  async function fetchBrands() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),

        limit: String(limit),

        search,

        sort,
      });

      const res = await fetch(`/api/brand?${params.toString()}`, {
        cache: "no-store",
      });

      const result: ApiResponse = await res.json();

      setBrands(result.data || []);

      setMeta({
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 1,
      });
    } catch (error) {
      console.error("BRAND FETCH ERROR:", error);

      setBrands([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBrands();
  }, [page, limit, search, sort]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Brand Management</h1>
          <p className="text-sm text-gray-500">
            Manage product brands efficiently
          </p>
        </div>

        <button
          onClick={() => {
            setEditData(null);
            setOpenForm(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Add Brand
        </button>
      </div>

      {/* FILTERS */}
      <SearchFilterBar
        fields={filterFields}
        globalSearchKey="search"
        globalSearchPlaceholder="Search brands..."
      />

      {/* COUNT */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Total Brands:{" "}
          <span className="font-semibold text-black">{meta.total}</span>
        </div>

        {loading && (
          <div className="text-sm text-gray-400 animate-pulse">
            Loading...
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-4">
        <BrandTable
          data={brands}
          onEdit={(brand: Brand) => {
            setEditData(brand);

            setOpenForm(true);
          }}
          onDelete={(id: number) => setDeleteId(id)}
        />
      </div>

      {/* PAGINATION */}
      <Pagination
        title="Brand"
        page={meta.page}
        totalPages={meta.totalPages}
        currentLimit={meta.limit}
      />

      {/* FORM MODAL */}
      {openForm && (
        <BrandForm
          data={editData}
          onClose={() => {
            setOpenForm(false);

            setEditData(null);
          }}
          refresh={fetchBrands}
        />
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <DeleteModal
          id={deleteId}
          onClose={() => setDeleteId(null)}
          refresh={fetchBrands}
        />
      )}
    </div>
  );
}
