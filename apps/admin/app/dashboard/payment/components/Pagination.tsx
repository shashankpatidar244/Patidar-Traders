"use client"

export default function Pagination({ meta, setPage }: any) {
  if (!meta?.totalPages) return null

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-between mt-6 px-2">

      {/* Left Info */}
      <p className="text-sm text-gray-500">
        Page <span className="font-medium">{meta.page}</span> of{" "}
        <span className="font-medium">{meta.totalPages}</span>
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">

        {/* Prev */}
        <button
          disabled={meta.page === 1}
          onClick={() => setPage(meta.page - 1)}
          className={`px-3 py-1 rounded border text-sm transition 
            ${meta.page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-100"}
          `}
        >
          ← Prev
        </button>

        {/* Page Numbers */}
        {pages.slice(
          Math.max(0, meta.page - 3),
          Math.min(meta.totalPages, meta.page + 2)
        ).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded text-sm border transition
              ${
                p === meta.page
                  ? "bg-black text-white border-black"
                  : "hover:bg-gray-100"
              }
            `}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={meta.page === meta.totalPages}
          onClick={() => setPage(meta.page + 1)}
          className={`px-3 py-1 rounded border text-sm transition 
            ${meta.page === meta.totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-100"}
          `}
        >
          Next →
        </button>
      </div>
    </div>
  )
}