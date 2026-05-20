"use client"

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

type Props = {
  data: { date: string; orders: number }[]
}

// 🎯 Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow border border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-white">
          {payload[0].value} Orders
        </p>
      </div>
    )
  }
  return null
}

export default function OrdersChart({ data }: Props) {
  const totalOrders = data?.reduce((sum, d) => sum + (d.orders ?? 0), 0) || 0

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">
            Orders Overview
          </h2>
          <p className="text-xs text-gray-400">
            Total: {totalOrders.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {!data || data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
          No order data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            
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

            {/* Bars */}
            <Bar
              dataKey="orders"
              radius={[6, 6, 0, 0]}
              fill="url(#colorGradient)"
              animationDuration={800}
            />

            {/* Gradient */}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
              </linearGradient>
            </defs>

          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}