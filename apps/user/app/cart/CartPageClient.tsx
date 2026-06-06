"use client";

import { useState, useEffect } from "react";
import CartItem from "./CartItem";
import Link from "next/link";

export default function CartPageClient({ cartItems }: any) {
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (cartItems.length === 0) return;

    const saved = localStorage.getItem("selectedCartItems");

    if (saved !== null) {
      const ids = JSON.parse(saved);

      const validIds = ids.filter((id: number) =>
        cartItems.some((item: any) => item.id === id)
      );

      setSelected(validIds);
      return;
    }

    setSelected(cartItems.map((item: any) => item.id));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("selectedCartItems", JSON.stringify(selected));
  }, [selected]);

  function handleSelect(item: any, checked: boolean) {
    if (checked) {
      setSelected((prev) =>
        prev.includes(item.id) ? prev : [...prev, item.id]
      );
    } else {
      setSelected((prev) => prev.filter((id) => id !== item.id));
    }
  }

  function toggleSelectAll(e: any) {
    if (e.target.checked) {
      setSelected(cartItems.map((item: any) => item.id));
    } else {
      setSelected([]);
    }
  }

  const selectedItems = cartItems.filter((item: any) =>
    selected.includes(item.id)
  );

  // Use sellingPrice
  const total = selectedItems.reduce(
    (sum: number, item: any) =>
      sum + (item.variant?.sellingPrice || 0) * item.quantity,
    0
  );

  const isAllSelected =
    cartItems.length > 0 && selected.length === cartItems.length;

  // Calculate total MRP (for discount summary)
  const totalMrp = selectedItems.reduce(
    (sum: number, item: any) => sum + (item.variant?.mrp || 0) * item.quantity,
    0
  );

  const totalDiscount = totalMrp > total ? totalMrp - total : 0;

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* CART ITEMS */}
          <div className="lg:col-span-2">
            <div className="bg-stone-50 border border-stone-200 rounded-3xl shadow-sm">
              {/* HEADER */}
              <div className="p-5 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />

                  <span className="font-semibold">
                    Select All ({cartItems.length} Items)
                  </span>
                </div>

                <span className="text-sm text-gray-500">
                  {selected.length} Selected
                </span>
              </div>

              {/* ITEMS */}
              <div className="space-y-4 p-4">
                {cartItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="text-6xl mb-4">🛒</div>

                    <h3 className="text-xl font-semibold mb-2">
                      Your cart is empty
                    </h3>

                    <p className="text-gray-500">
                      Add products to continue shopping
                    </p>
                  </div>
                ) : (
                  cartItems.map((item: any) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      selected={selected.includes(item.id)}
                      onSelect={handleSelect}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* HEADER */}
                <div className="p-5 border-b">
                  <h2 className="text-xl font-bold">Order Summary</h2>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span>{selectedItems.length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">MRP Total</span>

                    <span className="line-through text-gray-400">
                      ₹{totalMrp.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Selling Price</span>

                    <span>₹{total.toFixed(2)}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>

                      <span>- ₹{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>

                    <span className="text-green-600">FREE</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>

                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-700 font-medium text-sm">
                        You are saving ₹{totalDiscount.toFixed(2)} on this order
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/checkout?items=${selected.join(",")}`}
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
                      selected.length === 0
                        ? "bg-gray-300 text-gray-500 pointer-events-none"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    Proceed to Checkout
                  </Link>

                  <div className="text-xs text-gray-500 text-center">
                    Secure checkout • Cash on Delivery Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
