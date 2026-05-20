"use client"

export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">

      {/* KPI SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl shadow border space-y-3"
          >
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-300 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Revenue Chart */}
        <div className="bg-white p-5 rounded-2xl shadow border space-y-4">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-[220px] bg-gray-100 rounded-xl" />
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-5 rounded-2xl shadow border space-y-4">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-[220px] bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Top Products */}
        <div className="bg-white p-5 rounded-2xl shadow border space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-2 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="bg-white p-5 rounded-2xl shadow border">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-[180px] bg-gray-100 rounded-xl" />
        </div>

        {/* Payments */}
        <div className="bg-white p-5 rounded-2xl shadow border">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-[180px] bg-gray-100 rounded-full mx-auto w-[150px]" />
        </div>

      </div>
    </div>
  )
}