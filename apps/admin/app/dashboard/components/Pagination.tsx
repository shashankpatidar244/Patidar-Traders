"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";



interface PaginationProps {
  title?: string;
  page: number;
  totalPages: number;
  currentLimit: number;
}

export default function Pagination({
  title = "",
  page,
  totalPages,
  currentLimit,
}: PaginationProps) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();
  
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // UPDATE URL PARAMS
  function updateQuery(
    key: string,
    value: string | number
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set(key, String(value));

    // RESET PAGE WHEN LIMIT CHANGES
    if (key === "limit") {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function setPage(newPage: number) {
    updateQuery("page", newPage);
  }

  function updateLimit(newLimit: number) {
    updateQuery("limit", newLimit);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4 flex-wrap xl:flex-nowrap">
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm">
            <span className="text-sm font-bold">{page}</span>
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">
              Page {page} of {totalPages}
            </p>

            <p className="text-[12px] text-gray-500"> {title} Navigation</p>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-1 justify-center min-w-0">
          <div className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-50 px-2 py-2">
            {/* PREV */}
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`
        flex h-10 items-center gap-1 rounded-xl px-3
        text-sm font-medium transition-all duration-200
        ${
          page === 1
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "bg-white text-gray-700 hover:bg-black hover:text-white"
        }
      `}
            >
              <span className="text-xs">←</span>
              Prev
            </button>

            {/* PAGE NUMBERS */}
            <div className="flex items-center gap-1">
              {pages
                .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`
              relative flex h-10 min-w-[38px]
              items-center justify-center rounded-xl
              px-2 text-sm font-semibold
              transition-all duration-200
              ${
                p === page
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-700 hover:bg-white"
              }
            `}
                  >
                    {p}

                    {p === page && (
                      <div className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
                    )}
                  </button>
                ))}
            </div>

            {/* NEXT */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`
        flex h-10 items-center gap-1 rounded-xl px-3
        text-sm font-medium transition-all duration-200
        ${
          page === totalPages
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "bg-white text-gray-700 hover:bg-black hover:text-white"
        }
      `}
            >
              Next
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 min-w-fit">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            Rows
          </span>

          <select
            value={currentLimit}
            onChange={(e) => updateLimit(Number(e.target.value))}
            className="
      h-10 rounded-xl border border-gray-200
      bg-white px-3 text-sm font-medium text-gray-700
      outline-none transition-all duration-200
      focus:border-black focus:ring-2 focus:ring-black/10
    "
          >
            <option value={2}>2</option>
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
