"use client";

import { useState } from "react";
import {
  X,
  CreditCard,
  Wallet,
  CircleDollarSign,
  BadgeCheck,
} from "lucide-react";

interface PaymentInfoModalProps {
  order: any;
}

export default function PaymentInfoButton({ order }: PaymentInfoModalProps) {
  const [paymentInfoOpen, setPaymentInfoOpen] = useState(false);

  const itemsTotal =
    order.items?.reduce(
      (total: number, item: any) => total + Number(item.price) * item.quantity,
      0
    ) || 0;

  const shipping = 0;
  const platformFee = 0;

  const orderTotal = itemsTotal + shipping + platformFee;

  const statusColor =
    order.paymentStatus === "PAID"
      ? "text-emerald-600"
      : order.paymentStatus === "FAILED"
        ? "text-red-600"
        : "text-amber-600";

  return (
    <>
      <button
        type="button"
        onClick={() => setPaymentInfoOpen(true)}
        className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <CreditCard className="w-4 h-4 text-slate-400" />
        VIEW PAYMENT INFO
      </button>
      {paymentInfoOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPaymentInfoOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-[24px] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Payment Information
              </h2>

              <button
                onClick={() => setPaymentInfoOpen(false)}
                className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Items Ordered
                </h3>

                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <div className="flex gap-2.5 min-w-0">
                      <span className="font-semibold text-slate-400 shrink-0">
                        {item.quantity} ×
                      </span>

                      <span className="text-slate-600 font-medium truncate">
                        {item.product?.name}
                      </span>
                    </div>

                    <span className="font-bold text-slate-800 shrink-0">
                      ₹{(Number(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <CircleDollarSign size={16} />
                    <span>Items Total</span>
                  </div>

                  <span className="font-bold text-emerald-600">
                    ₹{itemsTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <CircleDollarSign size={16} />
                    <span>Total Discount</span>
                  </div>

                  <span className="font-bold text-emerald-600">
                    -₹{Number(order.discountAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Discounted Price
                  </span>

                  <span className="font-bold text-slate-800">
                    ₹
                    {Number(
                      order.subtotal || order.totalAmount
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Shipping Fee
                  </span>

                  <span className="font-bold text-slate-800">
                    ₹{shipping.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Platform Fee
                  </span>

                  <span className="font-bold text-slate-800">
                    ₹{platformFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="space-y-3 border border-slate-100 rounded-2xl p-5">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Payment Method</span>

                  <span className="font-semibold">
                    {order.paymentMethod || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Payment Status</span>
                  <span className={`font-semibold ${statusColor}`}>
                    {order.paymentStatus || "PENDING"}
                  </span>
                </div>
              </div>

              {/* Net Paid */}
              <hr className="border-slate-200 border-dashed" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">
                  Net Paid
                </span>

                <span className="font-bold text-slate-900 text-2xl">
                  ₹{orderTotal.toLocaleString()}
                </span>
              </div>

              {/* Payment Card */}
              <div className="bg-[#f4f4f5] rounded-xl p-4 flex items-center gap-3">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <Wallet size={18} className="text-slate-700" />
                </div>

                <div className="flex items-center gap-2 text-[15px]">
                  <span className="font-bold text-slate-900">
                    ₹{orderTotal.toLocaleString()}
                  </span>

                  <span className="text-slate-600">
                    Paid by {order.paymentMethod || "Online Payment"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPaymentInfoOpen(false)}
                className="w-full h-12 rounded-xl bg-slate-900 text-white font-medium hover:bg-black transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
