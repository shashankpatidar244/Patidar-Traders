"use client"

import { useState } from "react"

export default function BulkActions({
  selected,
  orders,
  refresh,
}: any) {
  const [loading, setLoading] = useState(false)

  if (selected.length === 0) return null

  const selectedOrders = orders.filter((o: any) =>
    selected.includes(o.id)
  )

  const status = selectedOrders[0]?.status

  async function run(action: string) {
    setLoading(true)

    const res = await fetch("/api/orders/bulk", {
      method: "PATCH",
      body: JSON.stringify({
        orderIds: selected,
        action,
      }),
    })

    const data = await res.json()

    if (!res.ok) alert(data.error)

    await refresh()
    setLoading(false)
  }

  const btn =
    "px-4 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="flex items-center justify-between bg-white border rounded-xl p-3 shadow-sm">

      {/* LEFT INFO */}
      <div className="text-sm text-gray-600">
        {selected.length} selected | Status:{" "}
        <span className="font-semibold text-gray-800">
          {status}
        </span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2">

        {status === "PENDING" && (
          <button
            disabled={loading}
            onClick={() => run("CONFIRM")}
            className={`${btn} bg-blue-600 hover:bg-blue-700`}
          >
            Confirm (Paid)
          </button>
        )}

        {status === "PAID" && (
          <button
            disabled={loading}
            onClick={() => run("SHIP")}
            className={`${btn} bg-purple-600 hover:bg-purple-700`}
          >
            Mark Shipped
          </button>
        )}

        {status === "SHIPPED" && (
          <button
            disabled={loading}
            onClick={() => run("DELIVER")}
            className={`${btn} bg-green-600 hover:bg-green-700`}
          >
            Mark Delivered
          </button>
        )}

        {status !== "DELIVERED" && (
          <button
            disabled={loading}
            onClick={() => run("CANCEL")}
            className={`${btn} bg-red-600 hover:bg-red-700`}
          >
            Cancel Orders
          </button>
        )}

      </div>
    </div>
  )
}