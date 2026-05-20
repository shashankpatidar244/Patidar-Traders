"use client"

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts"

type Props = {
  data: { date: string; revenue: number }[]
}

// 🎯 Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow border border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-white">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ data }: Props) {
  const totalRevenue =
    data?.reduce((sum, d) => sum + (d.revenue ?? 0), 0) || 0

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">
            Revenue Overview
          </h2>
          <p className="text-xs text-gray-400">
            Total: ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {!data || data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
          No revenue data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>

            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              strokeOpacity={0.1}
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Gradient Fill */}
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            {/* Area (background fill) */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="none"
              fill="url(#revenueGradient)"
            />

            {/* Line */}
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
              animationDuration={800}
            />

          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}