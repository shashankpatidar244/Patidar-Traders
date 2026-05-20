"use client"

import { useEffect, useState } from "react"

export default function InventoryHistory({
  variantId,
  onClose,
}: {
  variantId: number
  onClose: () => void
}) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetch(`/api/inventory/history?variantId=${variantId}`)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .finally(() => setLoading(false))
  }, [variantId])

  function formatDate(date: string) {
    const d = new Date(date)

    return {
      day: d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  function getActionColor(action: string) {
    if (action === "ADD") return "bg-green-100 text-green-700"
    if (action === "REDUCE") return "bg-red-100 text-red-700"
    return "bg-blue-100 text-blue-700"
  }

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* 🔳 BACKDROP */}
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 📦 DRAWER PANEL */}
      <div className="w-[380px] bg-white h-full shadow-2xl border-l flex flex-col animate-slideIn">

        {/* 🔝 HEADER */}
        <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg text-gray-900">
              Stock History
            </h2>
            <p className="text-xs text-gray-400">
              Variant ID: #{variantId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {/* 📜 CONTENT */}
        <div className="flex-1 overflow-y-auto p-4">

          {loading ? (
            <div className="text-sm text-gray-400 animate-pulse">
              Loading history...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-10">
              📭 No stock changes yet
            </div>
          ) : (
            <div className="space-y-4">

              {logs.map((log, i) => {
                const date = formatDate(log.createdAt)

                return (
                  <div key={log.id} className="relative pl-6">

                    {/* 🔵 TIMELINE DOT */}
                    <div className="absolute left-0 top-2 w-2 h-2 bg-gray-400 rounded-full" />

                    {/* 🔗 CONNECTOR */}
                    {i !== logs.length - 1 && (
                      <div className="absolute left-[3px] top-4 w-[2px] h-full bg-gray-200" />
                    )}

                    {/* 📦 CARD */}
                    <div className="border rounded-xl p-3 bg-gray-50 hover:bg-gray-100 transition">

                      {/* 🔥 STOCK CHANGE */}
                      <div className="flex items-center justify-between">

                        <div className="text-sm font-semibold text-gray-900">
                          {log.oldStock} → {log.newStock}
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getActionColor(log.action)}`}
                        >
                          {log.action}
                        </span>

                      </div>

                      {/* 👤 ADMIN */}
                      {log.admin?.username && (
                        <div className="text-xs text-gray-500 mt-1">
                          By: {log.admin.username}
                        </div>
                      )}

                      {/* ⏱ DATE */}
                      <div className="text-xs text-gray-400 mt-2">
                        {date.day} • {date.time}
                      </div>

                    </div>
                  </div>
                )
              })}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}