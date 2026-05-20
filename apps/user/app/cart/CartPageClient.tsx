"use client"

import { useState } from "react"
import CartItem from "./CartItem"
import Link from "next/link"

export default function CartPageClient({ cartItems }: any) {

  const [selected, setSelected] = useState<number[]>(
    cartItems.map((item: any) => item.id)
  )

  function handleSelect(item: any, checked: boolean) {
    if (checked) {
      setSelected((prev) =>
        prev.includes(item.id) ? prev : [...prev, item.id]
      )
    } else {
      setSelected((prev) =>
        prev.filter((id) => id !== item.id)
      )
    }
  }

  function toggleSelectAll(e: any) {
    if (e.target.checked) {
      setSelected(cartItems.map((item: any) => item.id))
    } else {
      setSelected([])
    }
  }

  const selectedItems = cartItems.filter((item: any) =>
    selected.includes(item.id)
  )

  // ✅ Use sellingPrice instead of price
  const total = selectedItems.reduce(
    (sum: number, item: any) =>
      sum + (item.variant?.sellingPrice || 0) * item.quantity,
    0
  )

  const isAllSelected = selected.length === cartItems.length

  // ✅ Calculate total MRP (for discount summary)
  const totalMrp = selectedItems.reduce(
    (sum: number, item: any) =>
      sum + (item.variant?.mrp || 0) * item.quantity,
    0
  )

  const totalDiscount =
    totalMrp > total ? totalMrp - total : 0

  return (
    <div className="max-w-6xl mx-auto p-8 grid grid-cols-3 gap-8">

      {/* LEFT SIDE */}
      <div className="col-span-2 space-y-6">

        <h1 className="text-3xl font-bold">
          Your Cart
        </h1>

        {/* SELECT ALL */}
        <div className="flex items-center gap-3 border-b pb-3">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
          />
          <span className="font-medium">
            Select All
          </span>
        </div>

        {cartItems.map((item: any) => (

          <CartItem
            key={item.id}
            item={item}
            selected={selected.includes(item.id)}
            onSelect={handleSelect}
          />

        ))}

      </div>

      {/* BILLING */}
      <div className="bg-white p-6 rounded-lg shadow h-fit">

        <h2 className="text-xl font-bold mb-4">
          Billing Details
        </h2>

        <div className="flex justify-between mb-2">
          <span>Items</span>
          <span>{selectedItems.length}</span>
        </div>

        {/* ✅ MRP Total */}
        <div className="flex justify-between text-sm text-gray-400 line-through">
          <span>MRP Total</span>
          <span>₹ {totalMrp}</span>
        </div>

        {/* ✅ Selling Price Total */}
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>₹ {total}</span>
        </div>

        {/* ✅ Discount */}
        {totalDiscount > 0 && (
          <div className="flex justify-between text-green-600 text-sm mb-2">
            <span>Discount</span>
            <span>- ₹ {totalDiscount}</span>
          </div>
        )}

        <div className="flex justify-between mb-4">
          <span>Shipping</span>
          <span>₹ 0</span>
        </div>

        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹ {total}</span>
        </div>

        {/* Checkout */}
        <Link
          href={`/checkout?items=${selected.join(",")}`}
          className={`block text-center py-3 rounded mt-4 transition ${
            selected.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          Checkout
        </Link>

      </div>

    </div>
  )
}