"use client"

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"]

export default function PaymentPie({ data }: any) {
  const isEmpty = !data || data.length === 0

  return (
    <div className="bg-white p-5 rounded-2xl shadow border h-[320px] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Payment Methods</h3>
        <span className="text-xs text-gray-400">Distribution</span>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
          No payment data available
        </div>
      ) : (
        <div className="flex flex-1">

          {/* Chart */}
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="method"
                  innerRadius={50}   // 🔥 donut style
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {data.map((_: any, index: number) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="w-1/2 flex flex-col justify-center gap-3 pl-4">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="text-gray-700">
                    {item.method}
                  </span>
                </div>

                <span className="font-medium text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}