"use client";

import { CreditCard, IndianRupee, PackageCheck, Wallet } from "lucide-react";

function Badge({ text, color }: any) {
  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-semibold
        border whitespace-nowrap
        ${color}
      `}
    >
      {text}
    </span>
  );
}

export default function OrderSummary({ order }: any) {
  const total = Number(order.total || 0);

  const paymentStatusColors: any = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",

    PAID: "bg-green-50 text-green-700 border-green-200",

    FAILED: "bg-red-50 text-red-700 border-red-200",

    REFUNDED: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const orderStatusColors: any = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",

    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",

    PACKED: "bg-purple-50 text-purple-700 border-purple-200",

    COMPLETED: "bg-green-50 text-green-700 border-green-200",

    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };

  const paymentMethodColors: any = {
    COD: "bg-gray-100 text-gray-700 border-gray-200",

    UPI: "bg-blue-50 text-blue-700 border-blue-200",

    CARD: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-5 py-4 border-b bg-gray-50">
        <h2 className="text-sm font-bold tracking-wide text-gray-700">
          ORDER SUMMARY
        </h2>
      </div>

      <div className="p-5 space-y-5">
        {/* PRICE CARD */}
        <div className="bg-gray-50 rounded-2xl p-4 border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>

            <span className="font-semibold text-gray-900">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm mt-3">
            <span className="text-gray-500">Shipping</span>

            <span className="font-medium text-green-600">FREE</span>
          </div>

          <div className="border-t mt-4 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Grand Total</p>

              <h3 className="text-2xl font-bold text-gray-900">
                ₹{total.toLocaleString("en-IN")}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
              <IndianRupee size={22} />
            </div>
          </div>
        </div>

        {/* PAYMENT METHOD */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              {order.paymentMethod === "COD" ? (
                <Wallet size={18} />
              ) : (
                <CreditCard size={18} />
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500">Payment Method</p>

              <p className="font-semibold text-gray-900">
                {order.paymentMethod}
              </p>
            </div>
          </div>

          <Badge
            text={order.paymentMethod}
            color={paymentMethodColors[order.paymentMethod]}
          />
        </div>

        {/* PAYMENT STATUS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
              <CreditCard size={18} />
            </div>

            <div>
              <p className="text-xs text-gray-500">Payment Status</p>

              <p className="font-semibold text-gray-900">
                {order.paymentStatus}
              </p>
            </div>
          </div>

          <Badge
            text={order.paymentStatus}
            color={paymentStatusColors[order.paymentStatus]}
          />
        </div>

        {/* ORDER STATUS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <PackageCheck size={18} />
            </div>

            <div>
              <p className="text-xs text-gray-500">Order Status</p>

              <p className="font-semibold text-gray-900">{order.status}</p>
            </div>
          </div>

          <Badge text={order.status} color={orderStatusColors[order.status]} />
        </div>

        {/* EXTRA INFO */}
        <div className="border-t pt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Order ID</span>

            <span className="font-medium text-gray-900">#{order.id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Items</span>

            <span className="font-medium text-gray-900">
              {order.items?.length || 0}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Ordered On</span>

            <span className="font-medium text-gray-900">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
