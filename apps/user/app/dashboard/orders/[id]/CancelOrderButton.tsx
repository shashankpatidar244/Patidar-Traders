"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CancelOrderButtonProps {
  orderId: number;
  disabled?: boolean;
}

export default function CancelOrderButton({
  orderId,
  disabled = false,
}: CancelOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to cancel order");
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Failed to cancel order"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={disabled || loading}
      className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:text-red-600 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Cancelling..." : "Cancel Order"}
    </button>
  );
}
