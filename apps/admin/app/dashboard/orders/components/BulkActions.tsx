"use client";

import { useState } from "react";

export default function BulkActions({ selected, orders, refresh }: any) {
  const [loading, setLoading] = useState(false);

  if (selected.length === 0) return null;

  const selectedOrders = orders.filter((o: any) => selected.includes(o.id));

  const status = selectedOrders[0]?.status;

  async function run(action: string) {
    try {
      setLoading(true);

      const res = await fetch("/api/orders/bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderIds: selected,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Bulk action failed");
        return;
      }

      await refresh();
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const btn =
    "px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* LEFT */}
      <div>
        <p className="text-sm text-gray-500">Selected Orders</p>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">
            {selected.length}
          </span>

          <span className="text-sm text-gray-500">orders selected</span>
        </div>

        <div className="mt-2">
          <span className="text-xs text-gray-500">Current Status:</span>

          <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {status}
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-wrap gap-2">
        {/* PENDING → CONFIRMED */}
        {status === "PENDING" && (
          <button
            disabled={loading}
            onClick={() => run("CONFIRM")}
            className={`${btn} bg-blue-600 hover:bg-blue-700`}
          >
            {loading ? "Processing..." : "Confirm Orders"}
          </button>
        )}

        {/* CONFIRMED → PACKED */}
        {status === "CONFIRMED" && (
          <button
            disabled={loading}
            onClick={() => run("PACK")}
            className={`${btn} bg-indigo-600 hover:bg-indigo-700`}
          >
            {loading ? "Processing..." : "Mark Packed"}
          </button>
        )}

        {/* PACKED → COMPLETED */}
        {status === "PACKED" && (
          <button
            disabled={loading}
            onClick={() => run("COMPLETE")}
            className={`${btn} bg-green-600 hover:bg-green-700`}
          >
            {loading ? "Processing..." : "Mark Completed"}
          </button>
        )}

        {/* CANCEL */}
        {status !== "COMPLETED" && status !== "CANCELLED" && (
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
  );
}
