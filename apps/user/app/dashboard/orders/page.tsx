"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function OrdersPage() {

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ==================================================
  // LOAD ORDERS
  // ==================================================

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders/me")
      const data = await res.json()
  
      // support both formats
      if (Array.isArray(data)) {
        setOrders(data)
      } else if (Array.isArray(data.orders)) {
        setOrders(data.orders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error(error)
      setOrders([])

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  // ==================================================
  // CANCEL ORDER
  // ==================================================

  async function cancelOrder(orderId: number) {

    const ok = confirm("Cancel this order?")

    if (!ok) return

    await fetch("/api/orders/cancel", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ orderId }),
    })

    loadOrders()
  }

  // ==================================================
  // RETRY PAYMENT
  // ==================================================

  async function retryPayment(orderId: number) {

    const res = await fetch("/api/payment/retry", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ orderId }),
    })

    const data = await res.json()

    if (!data.success) {
      alert(data.error || "Retry failed")
      return
    }

    const rzp = new window.Razorpay({

      key: data.key,

      amount: data.amount,

      currency: "INR",

      order_id: data.razorpayOrderId,

      name: "Your Store",

      description: "Retry Payment",

      handler: async function (response: any) {

        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ...response,
            orderId,
          }),
        })

        const verifyData = await verifyRes.json()

        if (verifyData.success) {

          window.location.reload()

        } else {

          alert("Payment verification failed")

        }
      },

      theme: {
        color: "#111827",
      },
    })

    rzp.open()
  }

  // ==================================================
  // STATUS COLORS
  // ==================================================

  function statusColor(status: string) {

    if (status === "COMPLETED") {
      return "bg-green-100 text-green-700"
    }

    if (status === "CONFIRMED") {
      return "bg-blue-100 text-blue-700"
    }

    if (status === "PACKED") {
      return "bg-purple-100 text-purple-700"
    }

    if (status === "CANCELLED") {
      return "bg-red-100 text-red-700"
    }

    return "bg-yellow-100 text-yellow-700"
  }

  function paymentColor(status: string) {

    if (status === "PAID") {
      return "text-green-600"
    }

    if (status === "FAILED") {
      return "text-red-600"
    }

    return "text-yellow-600"
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div className="max-w-6xl mx-auto py-20 text-center">

        <p className="text-lg text-gray-500">
          Loading your orders...
        </p>

      </div>
    )
  }

  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="max-w-6xl mx-auto px-4 md:px-0 py-6 space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="text-gray-500 mt-1">
            Track and manage your orders
          </p>

        </div>

        <div className="hidden md:block bg-white border rounded-xl px-4 py-2 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Orders
          </p>

          <p className="text-xl font-bold">
            {orders.length}
          </p>

        </div>

      </div>

      {/* EMPTY */}

      {orders.length === 0 && (

        <div className="bg-white border rounded-2xl p-16 text-center shadow-sm">

          <div className="text-6xl mb-4">
            📦
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            No Orders Yet
          </h2>

          <p className="text-gray-500 mb-6">
            Start shopping to place your first order.
          </p>

          <a
            href="/"
            className="inline-flex bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
          >
            Continue Shopping
          </a>

        </div>
      )}

      {/* ORDERS */}

      {orders.map((order) => (

        <div
          key={order.id}
          className="bg-white border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
        >

          {/* TOP */}

          <div className="border-b bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* LEFT */}

            <div>

              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <p className="font-bold text-lg">
                #{order.id}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </p>

            </div>

            {/* STATUS */}

            <div className="flex flex-wrap gap-3">

              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor(order.status)}`}
              >
                {order.status}
              </span>

              <span className="px-4 py-2 rounded-full text-sm bg-gray-100">
                {order.paymentMethod}
              </span>

              <span
                className={`px-4 py-2 rounded-full text-sm bg-gray-100 ${paymentColor(order.paymentStatus)}`}
              >
                {order.paymentStatus}
              </span>

            </div>

            {/* TOTAL */}

            <div className="text-right">

              <p className="text-sm text-gray-500">
                Total
              </p>

              <p className="text-2xl font-bold">
                ₹{order.total}
              </p>

            </div>

          </div>

          {/* PRODUCTS */}

          <div className="p-6 space-y-5">

            {order.items.map((item: any) => {

              const image =
                item.variant?.images?.[0]?.url ||
                item.product?.images?.[0]?.url ||
                "https://via.placeholder.com/150"

              return (

                <div
                  key={item.id}
                  className="flex gap-4 items-center border rounded-xl p-4 hover:bg-gray-50 transition"
                >

                  {/* IMAGE */}

                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border bg-gray-100">

                    <Image
                      src={image}
                      alt={item.product?.name ?? "Product"}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                  </div>

                  {/* INFO */}

                  <div className="flex-1">

                    <h3 className="font-semibold text-lg text-gray-900">

                      {item.product?.name}

                    </h3>

                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">

                      {item.variant?.value && (

                        <span className="bg-gray-100 px-2 py-1 rounded-md">

                          {item.variant?.value} {item.variant?.unit}

                        </span>
                      )}

                      <span className="bg-gray-100 px-2 py-1 rounded-md">

                        Qty: {item.quantity}

                      </span>

                    </div>

                  </div>

                  {/* PRICE */}

                  <div className="text-right">

                    <p className="text-sm text-gray-500">
                      Price
                    </p>

                    <p className="text-xl font-bold">
                      ₹{item.price}
                    </p>

                  </div>

                </div>
              )
            })}

          </div>

          {/* ADDRESS */}

          <div className="border-t px-6 py-5 bg-gray-50">

            <h3 className="font-semibold mb-3">
              📍 Delivery Address
            </h3>

            <div className="text-gray-600 leading-7">

              <p className="font-medium text-black">
                {order.shippingName}
              </p>

              <p>
                {order.shippingLine1}
              </p>

              {order.shippingLine2 && (
                <p>{order.shippingLine2}</p>
              )}

              <p>
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>

              <p>
                Phone: {order.shippingPhone}
              </p>

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t px-6 py-5 flex flex-wrap justify-between items-center gap-3">

            <div className="text-sm text-gray-500">

              Ordered on{" "}
              {new Date(order.createdAt).toLocaleDateString()}

            </div>

            <div className="flex flex-wrap gap-3">

              {/* RETRY */}

              {order.paymentStatus !== "PAID" &&
                order.status !== "CANCELLED" &&
                order.paymentMethod !== "COD" && (

                  <button
                    onClick={() => retryPayment(order.id)}
                    className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                  >
                    Retry Payment
                  </button>

                )}

              {/* CANCEL */}

              {order.status === "PENDING" && (

                <button
                  onClick={() => cancelOrder(order.id)}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition"
                >
                  Cancel Order
                </button>

              )}

              {/* DETAILS */}

              <button
                className="px-5 py-2.5 border rounded-xl hover:bg-gray-100 transition"
              >
                View Details
              </button>

            </div>

          </div>

        </div>

      ))}

    </div>
  )
}