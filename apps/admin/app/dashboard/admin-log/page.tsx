"use client"

import { useEffect, useState } from "react"

export default function AdminLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin-log")
      .then((res) => res.json())
      .then((data) => setLogs(data.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin Logs
        </h1>
        <p className="text-sm text-gray-500">
          Track all admin and system activities
        </p>
      </div>

      {/* 📦 Table Container */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        {/* Loading */}
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No logs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              {/* Header */}
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-gray-600">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Action</th>
                  <th className="p-3 font-medium">Entity</th>
                  <th className="p-3 font-medium">Entity ID</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-900">
                      #{log.id}
                    </td>

                    {/* Action Badge */}
                    <td className="p-3">
                      <ActionBadge action={log.action} />
                    </td>

                    <td className="p-3 text-gray-700">
                      {log.entity}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                        #{log.entityId}
                      </span>
                    </td>

                    <td className="p-3 text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* 🔥 Action Badge Component */
function ActionBadge({ action }: { action: string }) {
  const map: any = {
    MARK_PAID: "bg-green-100 text-green-700",
    REFUND: "bg-purple-100 text-purple-700",
    FAIL: "bg-red-100 text-red-700",
    SET_PENDING: "bg-yellow-100 text-yellow-700",
    WEBHOOK_PAYMENT_SUCCESS: "bg-blue-100 text-blue-700",
    WEBHOOK_PAYMENT_FAILED: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${
        map[action] || "bg-gray-100 text-gray-600"
      }`}
    >
      {action}
    </span>
  )
}