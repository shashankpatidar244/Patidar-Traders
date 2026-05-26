"use client";

import Link from "next/link";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderTable({
  orders = [],
  selected = [],
  setSelected,
}: any) {
  function toggle(id: number) {
    setSelected((prev: number[]) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selected.length === orders.length) {
      setSelected([]);
    } else {
      setSelected(orders.map((o: any) => o.id));
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1000px] text-sm">
        {/* HEADER */}
        <thead className="bg-gray-50 border-b sticky top-0 z-10">
          <tr className="text-left">
            <th className="p-4 w-[50px]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={selected.length === orders.length && orders.length > 0}
                onChange={toggleAll}
              />
            </th>

            <th className="p-4 font-semibold text-gray-600">Order</th>

            <th className="p-4 font-semibold text-gray-600">Customer</th>

            <th className="p-4 font-semibold text-gray-600">Phone</th>

            <th className="p-4 font-semibold text-gray-600">Payment</th>

            <th className="p-4 font-semibold text-gray-600">Amount</th>

            <th className="p-4 font-semibold text-gray-600">Status</th>

            <th className="p-4 font-semibold text-gray-600">Date</th>

            <th className="p-4 text-right font-semibold text-gray-600">
              Action
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {orders.map((o: any) => {
            const isSelected = selected.includes(o.id);

            return (
              <tr
                key={o.id}
                className={`
                  border-b transition-all duration-200
                  hover:bg-gray-50
                  ${isSelected ? "bg-blue-50/40" : ""}
                `}
              >
                {/* CHECKBOX */}
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={isSelected}
                    onChange={() => toggle(o.id)}
                  />
                </td>

                {/* ORDER */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">#{o.id}</span>

                    <span className="text-xs text-gray-400">
                      {o.items?.length || 0} items
                    </span>
                  </div>
                </td>

                {/* CUSTOMER */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {o.shippingName}
                    </span>

                    <span className="text-xs text-gray-400">
                      User #{o.userId}
                    </span>
                  </div>
                </td>

                {/* PHONE */}
                <td className="p-4 text-gray-600 whitespace-nowrap">
                  {o.shippingPhone}
                </td>

                {/* PAYMENT */}
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {o.paymentMethod}
                    </span>

                    <span
                      className={`
                        inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold
                        ${
                          o.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-700"
                            : o.paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : o.paymentStatus === "REFUNDED"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                        }
                      `}
                    >
                      {o.paymentStatus}
                    </span>
                  </div>
                </td>

                {/* AMOUNT */}
                <td className="p-4">
                  <div className="font-semibold text-gray-900 whitespace-nowrap">
                    ₹{Number(o.total).toLocaleString("en-IN")}
                  </div>
                </td>

                {/* STATUS */}
                <td className="p-4">
                  <OrderStatusBadge status={o.status} />
                </td>

                {/* DATE */}
                <td className="p-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-gray-700">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>

                    <span className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </td>

                {/* ACTION */}
                <td className="p-4 text-right">
                  <Link
                    href={`/dashboard/orders/${o.id}`}
                    className="
                      inline-flex items-center justify-center
                      rounded-lg border border-blue-200
                      px-4 py-2 text-sm font-medium
                      text-blue-600
                      hover:bg-blue-50
                      transition
                    "
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
