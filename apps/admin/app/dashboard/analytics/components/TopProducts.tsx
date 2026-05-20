"use client"

export default function TopProducts({ data }: any) {
  const isEmpty = !data || data.length === 0

  if (isEmpty) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow border">
        <h3 className="font-semibold text-lg mb-4">
          Top Products
        </h3>
        <p className="text-gray-400 text-sm text-center py-10">
          No product data available
        </p>
      </div>
    )
  }

  const max = Math.max(...data.map((p: any) => p.quantity))

  return (
    <div className="bg-white p-5 rounded-2xl shadow border">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          Top Products
        </h3>
        <span className="text-xs text-gray-400">
          Best sellers
        </span>
      </div>

      <div className="space-y-4">
        {data.map((p: any, i: number) => {
          const percent = (p.quantity / max) * 100

          return (
            <div key={i} className="space-y-1">

              {/* Top Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">

                  {/* Rank Badge */}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded 
                    ${i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-100 text-gray-700" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-50 text-gray-500"}
                  `}>
                    #{i + 1}
                  </span>

                  <span className="font-medium text-gray-800">
                    {p.name}
                  </span>
                </div>

                <span className="font-semibold text-gray-900">
                  {p.quantity}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500
                    ${i === 0 ? "bg-yellow-400" : "bg-indigo-500"}
                  `}
                  style={{ width: `${percent}%` }}
                />
              </div>

            </div>
          )
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-4">
        Showing top {data.length} performing products
      </p>

    </div>
  )
}