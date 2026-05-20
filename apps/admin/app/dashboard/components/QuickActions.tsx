"use client"

import { useRouter } from "next/navigation"
import {
  Package,
  ShoppingCart,
  Boxes,
  Layers,
} from "lucide-react"

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: "Products",
      desc: "Manage your products",
      icon: <Package size={18} />,
      path: "/dashboard/products",
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    },
    {
      title: "Orders",
      desc: "View and manage orders",
      icon: <ShoppingCart size={18} />,
      path: "/dashboard/orders",
      color: "bg-green-50 dark:bg-green-900/20 text-green-600",
    },
    {
      title: "Inventory",
      desc: "Track stock levels",
      icon: <Boxes size={18} />,
      path: "/dashboard/inventory",
      color: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
    },
    {
      title: "Categories",
      desc: "Organize products",
      icon: <Layers size={18} />,
      path: "/dashboard/categories",
      color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">
      
      {/* Header */}
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Quick Actions
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => router.push(action.path)}
            className="group p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all text-left"
          >
            
            {/* Icon */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-lg mb-3 ${action.color}`}
            >
              {action.icon}
            </div>

            {/* Title */}
            <p className="font-medium text-gray-800 dark:text-white">
              {action.title}
            </p>

            {/* Description */}
            <p className="text-xs text-gray-500 mt-1">
              {action.desc}
            </p>
          </button>
        ))}
      </div>

    </div>
  )
}