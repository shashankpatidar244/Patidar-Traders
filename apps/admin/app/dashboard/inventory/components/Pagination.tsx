"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  currentLimit: number;
  setPage: (page: number) => void;
  updateLimit: (limit: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  currentLimit,
  setPage,
  updateLimit,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            {page}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Page {page} of {totalPages}
            </p>

            <p className="text-xs text-gray-500">
              Inventory pagination controls
            </p>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          
          {/* PREV */}
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`
              h-10 px-4 rounded-xl border text-sm font-medium transition-all duration-200
              ${
                page === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-black hover:text-white hover:border-black"
              }
            `}
          >
            ← Prev
          </button>

          {/* PAGE NUMBERS */}
          {pages
            .slice(
              Math.max(0, page - 3),
              Math.min(totalPages, page + 2)
            )
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`
                  h-10 min-w-[40px] px-3 rounded-xl text-sm font-medium border transition-all duration-200
                  ${
                    p === page
                      ? "bg-black text-white border-black shadow-md"
                      : "bg-white border-gray-200 hover:bg-gray-100"
                  }
                `}
              >
                {p}
              </button>
            ))}

          {/* NEXT */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`
              h-10 px-4 rounded-xl border text-sm font-medium transition-all duration-200
              ${
                page === totalPages
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-black hover:text-white hover:border-black"
              }
            `}
          >
            Next →
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            Rows per page
          </span>

          <select
            value={currentLimit}
            onChange={(e) => updateLimit(Number(e.target.value))}
            className="
              h-10 rounded-xl border border-gray-200
              bg-white px-3 text-sm font-medium text-gray-700
              outline-none transition-all
              focus:border-black focus:ring-2 focus:ring-black/10
            "
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}