"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import OrderTimeline from "./components/OrderTimeline"
import OrderActions from "./components/OrderActions"
import OrderProducts from "./components/OrderProducts"
import OrderCustomer from "./components/OrderCustomer"
import OrderAddress from "./components/OrderAddress"
import OrderSummary from "./components/OrderSummary"
import OrderStatusBadge from "../components/OrderStatusBadge"

export default function OrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)

  async function loadOrder() {
    const res = await fetch(`/api/orders/${id}`)
    const data = await res.json()
    setOrder(data)
  }

  useEffect(() => {
    loadOrder()
  }, [])

  if (!order) {
    return (
      <div className="p-6 text-gray-500">
        Loading order details...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 HEADER CARD */}
      <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold">
            Order #{order.id}
          </h1>

          <div className="flex items-center gap-3 mt-2">
            <OrderStatusBadge status={order.status} />

            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </span>

            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
              {order.paymentMethod}
            </span>

            <span className="text-sm text-gray-600">
              {order.paymentStatus || "PENDING"}
            </span>
          </div>
        </div>

        <OrderActions order={order} reload={loadOrder} />
      </div>

      {/* 🔥 TIMELINE CARD */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <OrderTimeline status={order.status} />
      </div>

      {/* 🔥 MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <OrderProducts items={order.items} />
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <OrderCustomer user={order.user} />
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <OrderAddress order={order} />
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <OrderSummary order={order} />
          </div>

        </div>

      </div>
    </div>
  )
}