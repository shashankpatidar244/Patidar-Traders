"use client"

import { Sparkles, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

function getIcon(text: string) {
  if (text.includes("Revenue up")) return <TrendingUp className="text-green-400" size={18} />
  if (text.includes("dropped")) return <AlertTriangle className="text-red-400" size={18} />
  if (text.includes("low") || text.includes("stock")) return <AlertTriangle className="text-yellow-400" size={18} />
  if (text.includes("Strong")) return <CheckCircle className="text-green-400" size={18} />
  return <Sparkles className="text-indigo-300" size={18} />
}

export default function AIInsights({ data }: any) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-5 shadow">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <Sparkles size={18} />
          AI Insights
        </h3>
        <p className="text-sm text-gray-500">
          No insights available yet. Data will appear as your store grows.
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">

      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 opacity-90" />

      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl opacity-30" />

      {/* Content */}
      <div className="relative z-10 p-6 text-white">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-white" size={20} />
          <h3 className="font-semibold text-lg tracking-wide">
            AI Insights
          </h3>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {data.map((insight: string, i: number) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/10 hover:bg-white/20 transition"
            >
              <div className="mt-0.5">
                {getIcon(insight)}
              </div>

              <p className="text-sm leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}