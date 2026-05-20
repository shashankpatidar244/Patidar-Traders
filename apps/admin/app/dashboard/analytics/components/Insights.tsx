"use client"

import { AlertTriangle, Clock, XCircle } from "lucide-react"

export default function Insights({ data }: any) {
  const pending = data?.pendingOrders ?? 0
  const cancelled = data?.cancelledOrders ?? 0
  const lowStock = data?.lowStock ?? 0

  return (
    <div className="bg-white p-5 rounded-2xl shadow border">

      {/* Header */}
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <AlertTriangle size={18} className="text-yellow-500" />
        Store Alerts
      </h3>

      <div className="space-y-3">

        {/* Pending Orders */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-100">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">
              Pending Orders
            </span>
          </div>
          <span className="font-semibold text-yellow-700">
            {pending}
          </span>
        </div>

        {/* Cancelled Orders */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <span className="text-sm font-medium text-gray-700">
              Cancelled Orders
            </span>
          </div>
          <span className="font-semibold text-red-700">
            {cancelled}
          </span>
        </div>

        {/* Low Stock */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-gray-700">
              Low Stock Items
            </span>
          </div>
          <span className="font-semibold text-orange-700">
            {lowStock}
          </span>
        </div>

      </div>

      {/* Footer Hint */}
      <p className="text-xs text-gray-400 mt-4">
        Monitor these metrics to avoid revenue loss and improve operations.
      </p>

    </div>
  )
}