"use client"
import { useEffect, useState } from "react"
import { Sparkles, Users, TrendingUp } from "lucide-react"

type InsightsType = {
  topRevenueDay: string | null
  totalUsers: number
}

export default function Insights() {
  const [insights, setInsights] = useState<InsightsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/insights")
      .then(res => res.json())
      .then(data => setInsights(data))
      .catch(() => setInsights(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-500" size={18} />
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">
          Smart Insights
        </h2>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
        </div>
      )}

      {/* Data */}
      {!loading && insights && (
        <div className="space-y-4 text-sm">

          {/* Top Revenue Day */}
          <div className="flex items-start gap-3">
            <TrendingUp className="text-blue-500 mt-1" size={16} />
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Top Revenue Day
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {insights.topRevenueDay
                  ? new Date(insights.topRevenueDay).toLocaleDateString()
                  : "No data"}
              </p>
            </div>
          </div>

          {/* Total Users */}
          <div className="flex items-start gap-3">
            <Users className="text-green-500 mt-1" size={16} />
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                Total Users
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {insights.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Insight Badge */}
          <div className="mt-3">
            <span className="inline-block text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              AI Generated Insight
            </span>
          </div>

        </div>
      )}

      {/* Empty State */}
      {!loading && !insights && (
        <div className="text-sm text-gray-400">
          Unable to load insights
        </div>
      )}

    </div>
  )
}