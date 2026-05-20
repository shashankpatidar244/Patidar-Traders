"use client"

import { useEffect, useState } from "react"

export default function UserTimeline({ userId }: { userId: number }) {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/user/logs?userId=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed")
        return res.json()
      })
      .then(setLogs)
      .catch(() => setLogs([]))
  }, [userId])

  if (!logs.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow text-sm text-gray-500">
        No activity yet
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-4">Activity Timeline</h3>

      <div className="space-y-4">
      {logs.map((log) => {
    const config = getActionConfig(log.action)

    return (
        <div key={log.id} className="flex gap-3 items-start">

        {/* COLORED DOT */}
        <div className={`w-3 h-3 mt-2 rounded-full ${config.color}`} />

        {/* CONTENT */}
        <div>
            <p className="text-sm font-medium">
            {config.label}
            </p>

            {/* 👇 ADMIN NAME */}
            {log.admin?.username && (
            <p className="text-xs text-gray-500">
                by {log.admin.username}
            </p>
            )}

            <p className="text-xs text-gray-400">
            {new Date(log.createdAt).toLocaleString()}
            </p>
        </div>
        </div>
    )
    })}
      </div>
    </div>
  )
}

// 🔥 FORMAT TEXT
function getActionConfig(action: string) {
    switch (action) {
      case "BLOCK":
        return {
          label: "User blocked",
          color: "bg-red-500",
        }
      case "UNBLOCK":
        return {
          label: "User unblocked",
          color: "bg-green-500",
        }
      case "PROMOTE":
        return {
          label: "Promoted to Admin",
          color: "bg-purple-500",
        }
      case "DEMOTE":
        return {
          label: "Demoted to User",
          color: "bg-gray-500",
        }
      case "ORDER":
        return {
          label: "Order placed",
          color: "bg-blue-500",
        }
      default:
        return {
          label: action,
          color: "bg-gray-400",
        }
    }
  }