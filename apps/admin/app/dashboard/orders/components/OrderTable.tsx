"use client"

import OrderStatusBadge from "./OrderStatusBadge"
import Link from "next/link"

export default function OrderTable({ orders, selected, setSelected }: any) {

  function toggle(id: number) {
    setSelected((prev: number[]) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    )
  }

  function toggleAll() {
    if (selected.length === orders.length) {
      setSelected([])
    } else {
      setSelected(orders.map((o: any) => o.id))
    }
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
  
        {/* HEADER */}
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selected.length === orders.length && orders.length > 0}
                onChange={toggleAll}
              />
            </th>
  
            <th className="p-4 font-medium">Order</th>
            <th className="p-4 font-medium">Customer</th>
            <th className="p-4 font-medium">Phone</th>
            <th className="p-4 font-medium">Amount</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Date</th>
            <th className="p-4 text-right font-medium">Action</th>
          </tr>
        </thead>
  
        {/* BODY */}
        <tbody>
          {orders.map((o: any) => {
            return (
              <tr
                key={o.id}
                className="border-t hover:bg-gray-50 transition"
              >
                {/* CHECKBOX */}
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selected.includes(o.id)}
                    onChange={() => toggle(o.id)}
                  />
                </td>
  
                {/* ORDER ID */}
                <td className="p-4 font-semibold">
                  #{o.id}
                </td>
  
                {/* CUSTOMER */}
                <td className="p-4">
                  <div className="font-medium text-gray-800">
                    {o.shippingFullName}
                  </div>
                </td>
  
                {/* PHONE */}
                <td className="p-4 text-gray-600">
                  {o.shippingPhone}
                </td>
  
                {/* AMOUNT */}
                <td className="p-4 font-semibold text-gray-900">
                  ₹{o.total}
                </td>
  
                {/* STATUS */}
                <td className="p-4">
                  <OrderStatusBadge status={o.status} />
                </td>
  
                {/* DATE */}
                <td className="p-4 text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
  
                {/* ACTION */}
                <td className="p-4 text-right">
                  <Link
                    href={`/dashboard/orders/${o.id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}