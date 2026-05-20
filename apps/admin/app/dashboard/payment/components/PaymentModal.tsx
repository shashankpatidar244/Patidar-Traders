"use client"

import StatusBadge from "./StatusBadge"

export default function PaymentModal({ payment, onClose, onAction }: any) {
  if (!payment) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 z-50 animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Payment #{payment.id}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Status */}
        <div className="mb-4">
          <StatusBadge status={payment.paymentStatus} />
        </div>

        {/* Sections */}
        <div className="grid grid-cols-2 gap-4 text-sm">

          {/* Left */}
          <div className="space-y-2">
            <p><span className="text-gray-500">Amount:</span> ₹{payment.total}</p>
            <p><span className="text-gray-500">Method:</span> {payment.paymentMethod}</p>
            <p><span className="text-gray-500">Date:</span> {new Date(payment.createdAt).toLocaleString()}</p>
          </div>

          {/* Right */}
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="text-gray-500">Razorpay:</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {payment.razorpayOrderId || "-"}
              </span>

              {payment.razorpayOrderId && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(payment.razorpayOrderId)
                  }}
                  className="text-blue-600 text-xs hover:underline"
                >
                  Copy
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-5" />

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">

          {payment.paymentStatus === "PENDING" && (
            <button
              onClick={() => onAction(payment.id, "MARK_PAID")}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm"
            >
              Mark Paid
            </button>
          )}

          {payment.paymentStatus === "PAID" && (
            <button
              onClick={() => onAction(payment.id, "REFUND")}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Refund
            </button>
          )}

          {payment.paymentStatus === "REFUNDED" && (
            <>
              <button
                onClick={() => onAction(payment.id, "MARK_PAID")}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                Mark Paid
              </button>

              <button
                onClick={() => onAction(payment.id, "SET_PENDING")}
                className="bg-yellow-500 text-white px-4 py-2 rounded text-sm"
              >
                Set Pending
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-6 w-full border py-2 rounded text-sm hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  )
}