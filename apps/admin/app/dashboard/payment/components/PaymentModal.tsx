"use client";

import StatusBadge from "./StatusBadge";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

interface PaymentModalProps {
  payment: any;

  onClose: () => void;

  onAction: (
    id: number,
    action: "MARK_PAID" | "REFUND" | "SET_PENDING" | "FAIL"
  ) => void;
}

export default function PaymentModal({
  payment,
  onClose,
  onAction,
}: PaymentModalProps) {
  if (!payment) {
    return null;
  }

  const formattedDate = new Date(payment.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative z-50 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="border-b bg-gradient-to-r from-gray-50 to-white px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment #{payment.id}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Order payment details & actions
                  </p>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Order Button */}
              <button
                onClick={() => router.push(`/dashboard/orders/${payment.id}`)}
                className="
        inline-flex items-center gap-2
        px-4 py-2
        rounded-xl
        bg-blue-600
        hover:bg-blue-700
        text-white
        text-sm
        font-medium
        transition
      "
              >
                📦 View Order
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="
                          h-10 w-10
                          rounded-xl
                          border
                          bg-white
                          hover:bg-red-50
                          hover:text-red-600
                          flex items-center justify-center
                          transition
                        "
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* STATUS ROW */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={payment.paymentStatus} />

            <div className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
              {payment.paymentMethod}
            </div>

            <div className="px-3 py-1 rounded-full bg-blue-50 text-xs font-medium text-blue-700">
              {payment.deliveryStatus}
            </div>
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* PAYMENT DETAILS */}
            <div className="border rounded-2xl p-5 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Payment Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Amount</span>

                  <span className="font-semibold text-gray-900">
                    ₹{Number(payment.total).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Payment Method</span>

                  <span className="font-medium">{payment.paymentMethod}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Payment Status</span>

                  <span className="font-medium">{payment.paymentStatus}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Created</span>

                  <span className="font-medium text-right">
                    {formattedDate}
                  </span>
                </div>

                {payment.paidAt && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Paid At</span>

                    <span className="font-medium text-right">
                      {new Date(payment.paidAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CUSTOMER */}
            <div className="border rounded-2xl p-5 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Customer & Shipping
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Customer</p>

                  <p className="font-medium text-gray-900">
                    {payment.user?.username || "Unknown User"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs">Phone</p>

                  <p className="font-medium">{payment.shippingPhone}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs">Shipping Address</p>

                  <p className="font-medium leading-relaxed">
                    {payment.shippingLine1}
                    {payment.shippingLine2 &&
                      `, ${payment.shippingLine2}`}, {payment.shippingCity},{" "}
                    {payment.shippingState} - {payment.shippingPincode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RAZORPAY */}
          <div className="border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Razorpay Details
            </h3>

            <div className="space-y-4 text-sm">
              {/* ORDER ID */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">
                    Razorpay Order ID
                  </p>

                  <p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg break-all">
                    {payment.razorpayOrderId || "N/A"}
                  </p>
                </div>

                {payment.razorpayOrderId && (
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(payment.razorpayOrderId)
                    }
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Copy
                  </button>
                )}
              </div>

              {/* PAYMENT ID */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">
                    Razorpay Payment ID
                  </p>

                  <p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg break-all">
                    {payment.razorpayPaymentId || "N/A"}
                  </p>
                </div>

                {payment.razorpayPaymentId && (
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(payment.razorpayPaymentId)
                    }
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Copy
                  </button>
                )}
              </div>

              {/* TRACKING */}
              {payment.trackingId && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Tracking ID</p>

                  <p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg break-all">
                    {payment.trackingId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3 pt-2">
            {/* PENDING */}
            {payment.paymentStatus === "PENDING" && (
              <>
                {/* MARK PAID */}
                <button
                  onClick={() => {
                    const confirmAction = confirm(
                      `Mark payment #${payment.id} as PAID?`
                    );

                    if (!confirmAction) return;

                    onAction(payment.id, "MARK_PAID");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                >
                  Mark Paid
                </button>

                {/* MARK FAILED */}
                <button
                  onClick={() => {
                    const confirmAction = confirm(
                      `Mark payment #${payment.id} as FAILED?`
                    );

                    if (!confirmAction) return;

                    onAction(payment.id, "FAIL");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
                >
                  Mark Failed
                </button>
              </>
            )}

            {/* PAID */}
            {payment.paymentStatus === "PAID" && (
              <>
                {/* REFUND */}
                <button
                  onClick={() => {
                    const confirmAction = confirm(
                      `Refund payment #${payment.id}?`
                    );

                    if (!confirmAction) return;

                    onAction(payment.id, "REFUND");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
                >
                  Refund Payment
                </button>

                {/* FAIL */}
                <button
                  onClick={() => {
                    const confirmAction = confirm(
                      `Mark payment #${payment.id} as FAILED?`
                    );

                    if (!confirmAction) return;

                    onAction(payment.id, "FAIL");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
                >
                  Mark Failed
                </button>
              </>
            )}

            {/* FAILED / REFUNDED */}
            {(payment.paymentStatus === "FAILED" ||
              payment.paymentStatus === "REFUNDED") && (
              <>
                {/* MARK PAID */}
                <button
                  onClick={() => {
                    const confirmAction = confirm(
                      `Mark payment #${payment.id} as PAID?`
                    );

                    if (!confirmAction) return;

                    onAction(payment.id, "MARK_PAID");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                >
                  Mark Paid
                </button>

                {/* SET PENDING */}
                <button
                  onClick={() => {
                    const confirmAction = confirm(
                      `Set payment #${payment.id} back to PENDING?`
                    );

                    if (!confirmAction) return;

                    onAction(payment.id, "SET_PENDING");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium transition"
                >
                  Set Pending
                </button>
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t p-5 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full border border-gray-300 hover:bg-gray-100 rounded-xl py-3 text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
