"use client"
import { useEffect, useState } from "react"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

export default function RealtimeListener() {
  const [data, setData] = useState<{ timestamp: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        setError(false)

        const res = await fetch("/api/dashboard/realtime")
        const text = await res.text()

        const match = text.match(/data: (.+)/)

        if (match?.[1]) {
          const parsed = JSON.parse(match[1])
          setData(parsed)
          setLastUpdated(Date.now())
        }
      } catch (err) {
        console.error("Realtime fetch error:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchUpdate()
    const interval = setInterval(fetchUpdate, 10000)

    return () => clearInterval(interval)
  }, [])

  // ⏱ Relative time
  const getRelativeTime = () => {
    if (!lastUpdated) return ""
    const diff = Math.floor((Date.now() - lastUpdated) / 1000)

    if (diff < 5) return "just now"
    if (diff < 60) return `${diff}s ago`
    return `${Math.floor(diff / 60)}m ago`
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700 overflow-hidden">

      {/* Top Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 opacity-80" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Live Updates
          </h3>

          {/* Refresh Icon */}
          <RefreshCw
            size={14}
            className="text-gray-400 animate-spin-slow"
          />
        </div>

        {/* Status */}
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            error ? "text-red-500" : "text-green-600"
          }`}
        >
          {error ? (
            <>
              <WifiOff size={12} />
              Offline
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </>
          )}
        </span>
      </div>

      {/* Content */}
      <div className="text-sm text-gray-700 dark:text-gray-200 min-h-[40px]">
        {loading ? (
          <div className="animate-pulse h-4 w-32 bg-gray-200 rounded" />
        ) : data ? (
          <>
            <p className="font-medium">
              Last update:
              <span className="ml-1 text-blue-600 dark:text-blue-400">
                {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Synced {getRelativeTime()}
            </p>
          </>
        ) : (
          <p className="text-gray-400">No updates available</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span>Auto-refresh: 10s</span>
        <span className="flex items-center gap-1">
          <Wifi size={12} />
          Polling mode
        </span>
      </div>
    </div>
  )
}