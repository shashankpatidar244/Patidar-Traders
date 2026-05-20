"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export default function TopCategoriesChart({ data }: any) {
  const isEmpty = !data || data.length === 0

  return (
    <div className="bg-white p-5 rounded-2xl shadow border h-[320px] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          Top Categories
        </h3>
        <span className="text-xs text-gray-400">
          By sales volume
        </span>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
          No category data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"   // 🔥 horizontal bars
            margin={{ left: 10 }}
          >
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" />

            {/* Y Axis (Category Names) */}
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />

            {/* X Axis (Quantity) */}
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Tooltip */}
            <Tooltip
              formatter={(value: number | undefined) => [
                (value ?? 0),
                "Units Sold",
              ]}
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />

            {/* Bars */}
            <Bar
              dataKey="quantity"
              radius={[0, 6, 6, 0]}
              className="fill-indigo-500 hover:fill-indigo-600 transition"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}