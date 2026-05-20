"use client"

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts"

export default function RevenueChart({ data }: any) {
  const isEmpty = !data || data.length === 0

  // Calculate total revenue
  const totalRevenue =
    data?.reduce(
      (sum: number, item: any) => sum + (item.revenue || 0),
      0
    ) ?? 0

  return (
    <div className="bg-white p-5 rounded-2xl shadow border h-[320px] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            Revenue Overview
          </h3>
          <p className="text-xs text-gray-400">
            Total: ₹{totalRevenue.toLocaleString()}
          </p>
        </div>

        <span className="text-xs text-gray-400">
          Last period
        </span>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
          No revenue data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>

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
                formatter={(value: number | undefined) =>
                    `₹${(value ?? 0).toLocaleString()}`
                }
                contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ fontWeight: "bold" }}
            />

            {/* Area (background fill) */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={0.15}
            />

            {/* Line */}
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6366F1"
              strokeWidth={3}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}