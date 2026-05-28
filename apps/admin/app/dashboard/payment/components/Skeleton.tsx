export function TableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* TABLE HEADER */}
      <div className="overflow-x-auto">
        <div className="min-w-[1050px]">
          <div className="grid grid-cols-[50px_140px_220px_140px_160px_160px_140px_220px] gap-4 px-6 py-4 border-b bg-gray-50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-3 rounded bg-gray-200 animate-pulse" />
            ))}
          </div>

          {/* TABLE BODY */}
          <div className="divide-y animate-pulse">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="
                  grid
                  grid-cols-[50px_140px_220px_140px_160px_160px_140px_220px]
                  gap-4
                  px-6
                  py-5
                  items-center
                "
              >
                {/* CHECKBOX */}
                <div className="flex justify-center">
                  <div className="h-4 w-4 rounded bg-gray-200" />
                </div>

                {/* ORDER */}
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded bg-gray-200" />
                  <div className="h-3 w-12 rounded bg-gray-100" />
                  <div className="h-3 w-20 rounded bg-gray-100" />
                </div>

                {/* CUSTOMER */}
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-100" />
                  <div className="h-3 w-16 rounded bg-gray-100" />
                </div>

                {/* AMOUNT */}
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded bg-gray-200" />
                  <div className="h-3 w-14 rounded bg-gray-100" />
                </div>

                {/* PAYMENT */}
                <div className="space-y-2">
                  <div className="h-7 w-24 rounded-full bg-gray-200" />
                  <div className="h-3 w-16 rounded bg-gray-100" />
                </div>

                {/* METHOD */}
                <div className="space-y-2">
                  <div className="h-7 w-20 rounded-full bg-gray-200" />
                  <div className="h-3 w-28 rounded bg-gray-100" />
                </div>

                {/* DATE */}
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-16 rounded bg-gray-100" />
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 flex-wrap justify-end">
                  <div className="h-8 w-14 rounded-lg bg-gray-200" />
                  <div className="h-8 w-16 rounded-lg bg-gray-200" />
                  <div className="h-8 w-20 rounded-lg bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
