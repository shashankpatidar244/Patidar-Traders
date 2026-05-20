"use client"

import {
  XCircle,
  CreditCard,
  Wallet,
  PackageX,
  UserPlus,
} from "lucide-react"

type Props = {
  data: {
    cancelledOrders: number
    codCount: number
    onlineCount: number
    outOfStock: number
    newUsers: number
  }
}

export default function InsightsPanel({ data }: Props) {
  const items = [
    {
      label: "Cancelled Orders",
      value: data.cancelledOrders,
      icon: <XCircle size={16} />,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "Cash on Delivery",
      value: data.codCount,
      icon: <Wallet size={16} />,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: "Online Payments",
      value: data.onlineCount,
      icon: <CreditCard size={16} />,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Out of Stock",
      value: data.outOfStock,
      icon: <PackageX size={16} />,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "New Users",
      value: data.newUsers,
      icon: <UserPlus size={16} />,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">

      {/* Header */}
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Quick Insights
      </h2>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-lg ${item.bg} hover:scale-[1.02] transition`}
          >
            <div className="flex items-center gap-3">
              <div className={`${item.color}`}>
                {item.icon}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
            </div>

            <span className="font-semibold text-gray-800 dark:text-white">
            {(item.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-gray-400 text-right">
        Live business stats
      </div>
    </div>
  )
}