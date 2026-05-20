"use client"

import { formatDistanceToNow } from "date-fns"
import { Activity, Package, User, ShoppingCart } from "lucide-react"

type Log = {
  id: number
  action: string
  entity: string
  createdAt: string
}

export default function AdminLogs({ logs }: { logs: Log[] }) {
  const getIcon = (entity: string) => {
    switch (entity) {
      case "PRODUCT":
        return <Package size={16} />
      case "ORDER":
        return <ShoppingCart size={16} />
      case "USER":
        return <User size={16} />
      default:
        return <Activity size={16} />
    }
  }

  const getColor = (action: string) => {
    if (action.includes("CREATE")) return "text-green-600"
    if (action.includes("DELETE")) return "text-red-600"
    if (action.includes("UPDATE")) return "text-blue-600"
    return "text-gray-500"
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">
          Recent Activity
        </h2>
        <span className="text-xs text-gray-400">
          {logs?.length || 0} logs
        </span>
      </div>

      {/* Empty State */}
      {!logs || logs.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-6">
          No activity yet
        </div>
      ) : (
        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
          
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition"
            >
              
              {/* Icon */}
              <div className="mt-1 text-gray-500 dark:text-gray-300">
                {getIcon(log.entity)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  <span className={`font-medium ${getColor(log.action)}`}>
                    {log.action}
                  </span>{" "}
                  <span className="text-gray-500">{log.entity}</span>
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(log.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Dot indicator */}
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 group-hover:bg-blue-500 transition" />
            </div>
          ))}

        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-xs text-gray-400 text-right">
        Latest system logs
      </div>
    </div>
  )
}