"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"

interface KPICardProps {
  title: string
  value: number
  growth?: number
  icon?: React.ReactNode
}

export default function KPICard({
  title,
  value,
  growth,
  icon,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // 🔢 Smooth number animation
  useEffect(() => {
    let start = 0
    const duration = 600
    const increment = value / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplayValue(value)
        clearInterval(counter)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(counter)
  }, [value])

  const isPositive = (growth ?? 0) >= 0

  return (
    <div className="relative bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group">

      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-80 group-hover:opacity-100" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {title}
        </p>
        <div className="text-gray-400 group-hover:text-blue-500 transition">
          {icon}
        </div>
      </div>

      {/* Value */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
        {displayValue.toLocaleString()}
      </h2>

      {/* Growth */}
      {growth !== undefined && (
        <div className="flex items-center gap-1 mt-2 text-sm">
          {isPositive ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span
            className={`font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(growth).toFixed(1)}%
          </span>
          <span className="text-gray-400 text-xs">vs last period</span>
        </div>
      )}

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 bg-blue-500 transition pointer-events-none" />
    </div>
  )
}