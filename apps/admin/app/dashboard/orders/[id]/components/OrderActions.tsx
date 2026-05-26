"use client";

import { useState } from "react";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  XCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";

export default function OrderActions({ order, reload }: any) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    try {
      setLoading(true);

      const res = await fetch("/api/orders/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update order");
        return;
      }

      await reload();
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const buttonBase = `
    inline-flex items-center gap-2
    px-4 py-2.5
    rounded-xl
    text-sm font-semibold
    transition-all duration-200
    shadow-sm
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
      {/* TITLE */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Order Actions</h3>

          <p className="text-sm text-gray-500 mt-1">
            Manage order workflow & status
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3">
        {/* PENDING → CONFIRMED */}
        {order.status === "PENDING" && (
          <button
            disabled={loading}
            onClick={() => updateStatus("CONFIRMED")}
            className={`
              ${buttonBase}
              bg-blue-600 hover:bg-blue-700
              text-white
            `}
          >
            {loading ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Confirm Order
          </button>
        )}

        {/* CONFIRMED → PACKED */}
        {order.status === "CONFIRMED" && (
          <button
            disabled={loading}
            onClick={() => updateStatus("PACKED")}
            className={`
              ${buttonBase}
              bg-purple-600 hover:bg-purple-700
              text-white
            `}
          >
            {loading ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : (
              <PackageCheck size={16} />
            )}
            Mark Packed
          </button>
        )}

        {/* PACKED → COMPLETED */}
        {order.status === "PACKED" && (
          <button
            disabled={loading}
            onClick={() => updateStatus("COMPLETED")}
            className={`
              ${buttonBase}
              bg-green-600 hover:bg-green-700
              text-white
            `}
          >
            {loading ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : (
              <Truck size={16} />
            )}
            Mark Completed
          </button>
        )}

        {/* CANCEL */}
        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
          <button
            disabled={loading}
            onClick={() => updateStatus("CANCELLED")}
            className={`
                ${buttonBase}
                bg-red-600 hover:bg-red-700
                text-white
              `}
          >
            {loading ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : (
              <XCircle size={16} />
            )}
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
