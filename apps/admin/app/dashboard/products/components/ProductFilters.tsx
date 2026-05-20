"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useCategories } from "../hooks/useCategories"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { categories, isLoading } = useCategories()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("")
  const [categoryId, setCategoryId] = useState("")

  // ✅ Sync with URL
  useEffect(() => {
    setSearch(searchParams.get("search") || "")
    setStatus(searchParams.get("status") || "")
    setSort(searchParams.get("sort") || "")
    setCategoryId(searchParams.get("categoryId") || "")
  }, [searchParams])

  // ✅ Debounced URL update
  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      search ? params.set("search", search) : params.delete("search")
      status ? params.set("status", status) : params.delete("status")
      sort ? params.set("sort", sort) : params.delete("sort")
      categoryId
        ? params.set("categoryId", categoryId)
        : params.delete("categoryId")

      router.push(`/dashboard/products?${params.toString()}`)
    }, 500)

    return () => clearTimeout(delay)
  }, [search, status, sort, categoryId])

  return (
    <div className="bg-white p-5 rounded-2xl shadow flex flex-wrap gap-4 items-end">

      {/* 🔍 SEARCH */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Search</label>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* 📊 STATUS */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* 🗂 CATEGORY */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Category</label>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border px-3 py-2 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">
            {isLoading ? "Loading..." : "All Categories"}
          </option>

          {!isLoading && categories.length === 0 && (
            <option disabled>No categories</option>
          )}

          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔃 SORT */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Sort</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Default</option>
          <option value="newest">Newest</option>

          {/* ✅ Updated labels */}
          <option value="price_low">
            Price (Selling) Low → High
          </option>

          <option value="price_high">
            Price (Selling) High → Low
          </option>
        </select>
      </div>

      {/* ❌ RESET */}
      <button
        onClick={() => router.push("/dashboard/products")}
        className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
      >
        Reset
      </button>
    </div>
  )
}