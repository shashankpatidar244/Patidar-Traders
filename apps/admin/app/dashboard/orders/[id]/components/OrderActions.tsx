"use client"

import { useState } from "react"

export default function OrderActions({ order, reload }: any) {
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)

    await fetch("/api/orders/status", {
      method: "PATCH",
      body: JSON.stringify({
        orderId: order.id,
        status,
      }),
    })

    await reload()
    setLoading(false)
  }

  const btn =
    "px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="flex flex-wrap gap-2">

      {order.status === "PENDING" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("PAID")}
          className={`${btn} bg-blue-600 hover:bg-blue-700 text-white`}
        >
          {loading ? "Processing..." : "Confirm (Paid)"}
        </button>
      )}

      {order.status === "PAID" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("SHIPPED")}
          className={`${btn} bg-purple-600 hover:bg-purple-700 text-white`}
        >
          {loading ? "Processing..." : "Mark Shipped"}
        </button>
      )}

      {order.status === "SHIPPED" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("DELIVERED")}
          className={`${btn} bg-green-600 hover:bg-green-700 text-white`}
        >
          {loading ? "Processing..." : "Mark Delivered"}
        </button>
      )}

      {order.status !== "DELIVERED" &&
        order.status !== "CANCELLED" && (
          <button
            disabled={loading}
            onClick={() => updateStatus("CANCELLED")}
            className={`${btn} bg-red-600 hover:bg-red-700 text-white`}
          >
            Cancel Order
          </button>
        )}
    </div>
  )
}