export default function Pagination({ page, pages, setPage }: any) {
  const btn =
    "px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"

  return (
    <div className="flex items-center gap-3">

      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className={btn}
      >
        ← Prev
      </button>

      <span className="text-sm font-medium text-gray-700">
        {page} / {pages}
      </span>

      <button
        disabled={page === pages}
        onClick={() => setPage(page + 1)}
        className={btn}
      >
        Next →
      </button>

    </div>
  )
}