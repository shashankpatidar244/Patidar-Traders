"use client"

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export default function OrdersChart({ data }: any) {
  const isEmpty = !data || data.length === 0

  return (
    <div className="bg-white p-5 rounded-2xl shadow border h-[320px] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Orders Overview</h3>
        <span className="text-xs text-gray-400">
          Last period
        </span>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
          No order data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={20}>
            
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" />

            {/* X Axis */}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ fontWeight: "bold" }}
            />

            {/* Bars */}
            <Bar
              dataKey="orders"
              radius={[6, 6, 0, 0]}
              className="fill-indigo-500 hover:fill-indigo-600 transition"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}