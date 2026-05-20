"use client";

import { useState } from "react";

export default function AddToCartButton({
  productId,
  variantId,
  stock = 0,
}: {
  productId: number;
  variantId: number;
  stock?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(0);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  function showToast(
    message: string,
    type: "success" | "error" = "success"
  ) {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 2000);
  }

  async function updateCart(quantity: number) {
    try {
      setLoading(true);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      return true;
    } catch (error) {
      console.error("Cart update failed:", error);

      showToast("Something went wrong", "error");

      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    setQty(1);

    const success = await updateCart(1);

    if (success) {
      showToast("Added to cart");
    }
  }

  async function increaseQty() {
    if (loading) return;

    if (qty >= stock) {
      showToast("Maximum stock reached", "error");
      return;
    }

    const newQty = qty + 1;

    setQty(newQty);

    const success = await updateCart(newQty);

    if (success) {
      showToast("Quantity increased");
    }
  }

  async function decreaseQty() {
    if (loading) return;

    if (qty <= 1) {
      setQty(0);

      const success = await updateCart(0);

      if (success) {
        showToast("Removed from cart");
      }

      return;
    }

    const newQty = qty - 1;

    setQty(newQty);

    const success = await updateCart(newQty);

    if (success) {
      showToast("Quantity decreased");
    }
  }

  /* SOLD OUT */
  if (stock <= 0) {
    return (
      <>
        <button
          disabled
          className="w-full h-[56px] rounded-xl bg-[#9f9aac] text-white font-medium cursor-not-allowed"
        >
          Sold Out
        </button>

        {toast.show && (
          <div
            className={`fixed top-5 right-5 z-[99999] px-4 py-3 rounded-xl shadow-lg text-white font-medium animate-in slide-in-from-top duration-300 ${
              toast.type === "success"
                ? "bg-[#2d9b4d]"
                : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        )}
      </>
    );
  }

  /* ADD TO CART BUTTON */
  if (qty === 0) {
    return (
      <>
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="w-full h-[56px] rounded-xl bg-[#f89a1c] hover:bg-[#eb920f] active:scale-[0.98] text-black font-semibold transition-all disabled:opacity-70"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>

        {toast.show && (
          <div
            className={`fixed top-5 right-5 z-[99999] px-4 py-3 rounded-xl shadow-lg text-white font-medium animate-in slide-in-from-top duration-300 ${
              toast.type === "success"
                ? "bg-[#2d9b4d]"
                : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        )}
      </>
    );
  }

  /* QTY CONTROLS */
  return (
    <>
      <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 h-[56px] bg-white shadow-sm">
        
        {/* MINUS */}
        <button
          type="button"
          onClick={decreaseQty}
          disabled={loading}
          className="w-[50px] h-full text-[#f89a1c] text-2xl font-bold border-r hover:bg-orange-50 active:scale-95 transition disabled:opacity-50"
        >
          -
        </button>

        {/* COUNT */}
        <div className="w-[50px] h-full bg-[#2d9b4d] text-white flex items-center justify-center font-bold text-lg">
          {loading ? "..." : qty}
        </div>

        {/* PLUS */}
        <button
          type="button"
          onClick={increaseQty}
          disabled={loading || qty >= stock}
          className="w-[50px] h-full text-black text-2xl font-bold border-l hover:bg-gray-50 active:scale-95 transition disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-[99999] px-4 py-3 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-top duration-300 ${
            toast.type === "success"
              ? "bg-[#2d9b4d]"
              : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}