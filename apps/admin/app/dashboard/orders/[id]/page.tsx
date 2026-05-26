"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { CalendarDays, CreditCard, Hash } from "lucide-react";

import OrderTimeline from "./components/OrderTimeline";
import OrderActions from "./components/OrderActions";
import OrderProducts from "./components/OrderProducts";
import OrderCustomer from "./components/OrderCustomer";
import OrderAddress from "./components/OrderAddress";
import OrderSummary from "./components/OrderSummary";
import OrderStatusBadge from "../components/OrderStatusBadge";

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadOrder() {
    try {
      setLoading(true);

      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setOrder(null);
        return;
      }

      setOrder(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  // LOADING
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-white border rounded-2xl h-32" />

          <div className="bg-white border rounded-2xl h-32" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white border rounded-2xl h-[500px]" />
            </div>

            <div className="space-y-6">
              <div className="bg-white border rounded-2xl h-40" />
              <div className="bg-white border rounded-2xl h-52" />
              <div className="bg-white border rounded-2xl h-60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR
  if (!order || order.error) {
    return (
      <div className="p-6">
        <div className="bg-white border rounded-2xl p-10 text-center shadow-sm">
          <div className="text-5xl mb-4">📦</div>

          <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>

          <p className="text-gray-500 mt-2">
            The requested order does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* TOP */}
        <div className="p-6 md:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              {/* ORDER ID + STATUS */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                {/* LEFT */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-sm shrink-0">
                    <Hash size={24} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                      Order ID
                    </p>

                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-1">
                      #{order.id}
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                      Manage and track this order
                    </p>
                  </div>
                </div>

                {/* QUICK STATUS */}
                <div className="space-y-3">
                  {/* LABEL */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Quick Status
                    </p>
                  </div>

                  {/* BADGES */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div title="Current Order Status">
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <span
                      title="Selected Payment Method"
                      className="
      px-4 py-2 rounded-xl
      bg-gray-100 text-gray-700
      text-sm font-semibold
      border border-gray-200
      transition-all duration-200
      hover:scale-105 hover:shadow-sm
      cursor-default
    "
                    >
                      {order.paymentMethod}
                    </span>

                    <span
                      title="Current Payment Status"
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border
    transition-all duration-200
    hover:scale-105 hover:shadow-sm
    cursor-default
    ${
      order.paymentStatus === "PAID"
        ? "bg-green-50 text-green-700 border-green-200"
        : order.paymentStatus === "FAILED"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-yellow-50 text-yellow-700 border-yellow-200"
    }`}
                    >
                      {order.paymentStatus}
                    </span>

                    {order.deliveryStatus && (
                      <span
                        title="Current Delivery Status"
                        className="
        px-4 py-2 rounded-xl
        bg-purple-50 text-purple-700
        text-sm font-semibold
        border border-purple-200
        transition-all duration-200
        hover:scale-105 hover:shadow-sm
        cursor-default
      "
                      >
                        {order.deliveryStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* INFO CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DATE */}
                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-sm">
                    <CalendarDays size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Ordered On
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                      {order?.createdAt &&
                      !isNaN(new Date(order.createdAt).getTime())
                        ? new Date(order.createdAt).toLocaleString("en-IN")
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* PAYMENT */}
                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-700 shadow-sm">
                    <CreditCard size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Payment Method
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-start xl:items-end gap-4">
              <div className="bg-gray-50 border rounded-2xl px-6 py-4 min-w-[220px]">
                <p className="text-sm text-gray-500 mb-1">Order Total</p>

                <h2 className="text-3xl font-bold text-gray-900">
                  ₹{Number(order.total || 0).toFixed(2)}
                </h2>
              </div>

              <OrderActions order={order} reload={loadOrder} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= TIMELINE ================= */}
      <OrderTimeline status={order.status} />

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-6">
          <OrderProducts items={order?.items || []} />
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          <OrderCustomer user={order?.user} />

          <OrderAddress order={order} />

          <OrderSummary order={order} />
        </div>
      </div>
    </div>
  );
}
