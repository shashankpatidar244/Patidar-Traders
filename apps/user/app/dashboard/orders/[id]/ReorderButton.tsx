"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface ReorderItem {
  productId: number;
  variantId: number | null;
  quantity: number;
}

interface ReorderButtonProps {
  order: {
    items: ReorderItem[];
  };
}

export default function ReorderButton({ order }: ReorderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReorder() {
    try {
      setLoading(true);

      for (const item of order.items) {
        const response = await fetch("/api/cart/item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add item to cart");
        }
      }

      toast.success("Items added to cart");

      router.push("/cart");
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Failed to reorder items"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className="px-5 py-2.5 bg-indigo-600 border border-transparent text-white text-sm font-semibold hover:bg-indigo-700 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Adding..." : "Reorder Items"}
    </button>
  );
}
