"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function Pagination({
  total,
  limit = 10,
}: {
  total: number
  limit?: number
}) {
  const router = useRouter()
  const params = useSearchParams()

  const page = Number(params.get("page") || 1)
  const currentLimit = Number(params.get("limit") || limit)

  const totalPages = Math.ceil(total / currentLimit)

  const update = (newPage: number) => {
    const p = new URLSearchParams(params.toString())
    p.set("page", String(newPage))
    router.push(`?${p.toString()}`)
  }

  const updateLimit = (newLimit: number) => {
    const p = new URLSearchParams(params.toString())
    p.set("limit", String(newLimit))
    p.set("page", "1") // reset page
    router.push(`?${p.toString()}`)
  }

  // ================= PAGE BUTTONS =================
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

      {/* LIMIT SELECT */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        Show:
        <select
          value={currentLimit}
          onChange={(e) => updateLimit(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        per page
      </div>

      {/* PAGINATION */}
      <div className="flex items-center gap-2">

        {/* PREV */}
        <button
          onClick={() => update(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 rounded border disabled:opacity-40"
        >
          Prev
        </button>

        {/* PAGE NUMBERS */}
        {pages.slice(
          Math.max(0, page - 3),
          Math.min(totalPages, page + 2)
        ).map((p) => (
          <button
            key={p}
            onClick={() => update(p)}
            className={`px-3 py-1 rounded border ${
              p === page
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        {/* NEXT */}
        <button
          onClick={() => update(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 rounded border disabled:opacity-40"
        >
          Next
        </button>

      </div>

      {/* INFO */}
      <div className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </div>

    </div>
  )
}