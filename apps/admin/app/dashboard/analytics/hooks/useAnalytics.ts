"use client"

import { useEffect, useState } from "react"

interface AnalyticsData {
  revenue: number
  revenueGrowth: number
  totalOrders: number
  totalUsers: number
  conversionRate: number

  revenueChart: { date: string; revenue: number }[]
  ordersChart: { date: string; orders: number }[]

  topProducts: { name: string; quantity: number }[]
  topCategories: { name: string; quantity: number }[]

  paymentMethods: { method: string; count: number }[]

  pendingOrders: number
  cancelledOrders: number
  lowStock: number
  outOfStock: number

  insights: string[]
}

export function useAnalytics(range: string) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchAnalytics() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/analytics?range=${range}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error("Failed to fetch analytics")
        }

        const json = await res.json()

        setData(json)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err)
          setError("Something went wrong")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()

    return () => controller.abort() // 🔥 prevents memory leaks
  }, [range])

  return { data, loading, error }
}