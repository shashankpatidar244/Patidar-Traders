"use client"

import { useState } from "react"
import { useDashboard } from "../hooks/useDashboard"
import KPICard from "./KPICard"
import RevenueChart from "./RevenueChart"
import OrdersChart from "./OrdersChart"
import QuickActions from "./QuickActions"
import InsightsPanel from "./InsightsPanel"
import RecentOrders from "./RecentOrders"
import AdminLogs from "./AdminLogs"
import RealtimeListener from "./RealtimeListener"
import Insights from "./Insights"
import { useTheme } from "../context/ThemeProvider"
import { Download, Moon, Sun } from "lucide-react"

// Skeleton
export function Skeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

export default function DashboardClient() {
  const [range, setRange] = useState<7 | 30>(7)
  const { data, isLoading } = useDashboard(range)
  const { isDark, toggleTheme } = useTheme()

  const handleExport = () => {
    window.open("/api/dashboard/export", "_blank")
  }

  if (isLoading) return <Skeleton />

  const safeData = {
    revenue: data?.revenue ?? 0,
    totalOrders: data?.totalOrders ?? 0,
    pendingOrders: data?.pendingOrders ?? 0,
    totalUsers: data?.totalUsers ?? 0,
    totalProducts: data?.totalProducts ?? 0,
    lowStock: data?.lowStock ?? 0,
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur p-3 rounded-xl border border-gray-100 dark:border-gray-700">

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Overview of your store performance
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">

          {/* Range Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[7, 30].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r as 7 | 30)}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  range === r
                    ? "bg-white dark:bg-gray-700 shadow text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {r}D
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {isDark ? (
              <Sun size={16} className="text-yellow-500" />
            ) : (
              <Moon size={16} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* 📊 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <KPICard title="Revenue" value={safeData.revenue} growth={data?.growth} />
        <KPICard title="Orders" value={safeData.totalOrders} />
        <KPICard title="Pending" value={safeData.pendingOrders} />
        <KPICard title="Users" value={safeData.totalUsers} />
        <KPICard title="Products" value={safeData.totalProducts} />
        <KPICard title="Low Stock" value={safeData.lowStock} />
      </div>

      {/* 📈 CHARTS */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <RevenueChart data={data?.revenueChart || []} />
        </div>
        <OrdersChart data={data?.ordersChart || []} />
      </div>

      {/* 📦 INSIGHTS + REALTIME */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-4">
          <InsightsPanel data={data || {}} />
          <RealtimeListener />
          <Insights />
        </div>
      </div>

      {/* ⚡ QUICK ACTIONS */}
      <QuickActions />

      {/* 📜 TABLES */}
      <div className="grid md:grid-cols-2 gap-4">
        <RecentOrders orders={data?.recentOrders || []} />
        <AdminLogs logs={data?.adminLogs || []} />
      </div>

    </div>
  )
}