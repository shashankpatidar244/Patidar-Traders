"use client"

import { useEffect, useState } from "react"
import CategoryTable from "./components/CategoryTable"
import CategoryForm from "./components/CategoryForm"
import DeleteModal from "./components/DeleteModal"

export interface Category {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    products: number
  }
}

interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")

  const [openForm, setOpenForm] = useState(false)
  const [editData, setEditData] = useState<Category | null>(null)

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<Meta | null>(null)

  const fetchData = async () => {
    const res = await fetch(
      `/api/category?search=${search}&sort=${sort}&page=${page}&limit=10`
    )
    const result = await res.json()
    setCategories(result.data)
    setMeta(result.meta)
  }

  useEffect(() => {
    fetchData()
  }, [search, sort, page])

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Category Management</h1>
          <p className="text-sm text-gray-500">
            Manage product categories efficiently
          </p>
        </div>

        <button
          onClick={() => {
            setEditData(null)
            setOpenForm(true)
          }}
          className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Add Category
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-3 w-full md:w-auto">
          <input
            placeholder="Search category..."
            className="border px-3 py-2 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-black"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />

          <select
            className="border px-3 py-2 rounded-lg focus:outline-none"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most">Most Products</option>
          </select>
        </div>

        {/* COUNT */}
        <div className="text-sm text-gray-500 flex items-center">
          Total: <span className="ml-1 font-medium">{meta?.total ?? 0}</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-4">
        <CategoryTable
          data={categories}
          onEdit={(c: Category) => {
            setEditData(c)
            setOpenForm(true)
          }}
          onDelete={(id: number) => setDeleteId(id)}
        />
      </div>

      {/* MODALS */}
      {openForm && (
        <CategoryForm
          data={editData}
          onClose={() => setOpenForm(false)}
          refresh={fetchData}
        />
      )}

      {deleteId && (
        <DeleteModal
          id={deleteId}
          onClose={() => setDeleteId(null)}
          refresh={fetchData}
        />
      )}

      {/* PAGINATION */}
      <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
        >
          Prev
        </button>

        <span className="text-sm font-medium">
          Page {meta?.page ?? 1} of {meta?.totalPages ?? 1}
        </span>

        <button
          disabled={!meta || page >= meta.totalPages}
          onClick={() =>
            setPage((p) =>
              meta ? Math.min(meta.totalPages, p + 1) : p
            )
          }
          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  )
}