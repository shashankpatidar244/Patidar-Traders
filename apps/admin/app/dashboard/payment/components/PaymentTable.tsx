"use client";

import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";

interface PaymentTableProps {
  data: any[];
  onAction: (id: number, action: string) => void;
  onView: (payment: any) => void;
  selectedIds: number[];
  setSelectedIds: any;
}

export default function PaymentTable({
  data,
  onAction,
  onView,
  selectedIds,
  setSelectedIds,
}: PaymentTableProps) {
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  // SELECT ALL
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((p: any) => p.id));
    }
  };

  // SELECT ROW
  const toggleRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i: number) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-sm">
          {/* HEADER */}
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr className="text-left text-gray-600">
              {/* SELECT */}
              <th className="p-4 w-[50px]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-black"
                />
              </th>

              {/* ORDER */}
              <th className="p-4 font-semibold whitespace-nowrap">Order</th>

              {/* CUSTOMER */}
              <th className="p-4 font-semibold whitespace-nowrap">Customer</th>

              {/* AMOUNT */}
              <th className="p-4 font-semibold whitespace-nowrap">Amount</th>

              {/* PAYMENT */}
              <th className="p-4 font-semibold whitespace-nowrap">Payment</th>

              {/* METHOD */}
              <th className="p-4 font-semibold whitespace-nowrap">Method</th>

              {/* DATE */}
              <th className="p-4 font-semibold whitespace-nowrap">Date</th>

              {/* ACTIONS */}
              <th className="p-4 font-semibold whitespace-nowrap text-right">
                Actions
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              data.map((p: any) => {
                const isSelected = selectedIds.includes(p.id);

                return (
                  <tr
                    key={p.id}
                    onClick={() => onView(p)}
                    className={`
                      border-t transition cursor-pointer
                      ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                    `}
                  >
                    {/* CHECKBOX */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(p.id)}
                        className="w-4 h-4 accent-black"
                      />
                    </td>

                    {/* ORDER */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          #{p.id}
                        </span>

                        <span className="text-xs text-gray-400">
                          {p.items?.length || 0} items
                        </span>
                      </div>
                    </td>

                    {/* CUSTOMER */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {p.shippingName || "Guest"}
                        </span>

                        <span className="text-xs text-gray-500">
                          {p.user?.phone || p.shippingPhone || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* AMOUNT */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          ₹{Number(p.total || 0).toLocaleString("en-IN")}
                        </span>

                        {p.paymentStatus === "REFUNDED" && (
                          <span className="text-xs text-red-500">Refunded</span>
                        )}
                      </div>
                    </td>

                    {/* PAYMENT + DELIVERY */}
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={p.paymentStatus} />

                        <div className="text-xs text-gray-500">
                          {p.deliveryStatus}
                        </div>
                      </div>
                    </td>

                    {/* METHOD */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`
                            inline-flex items-center
                            w-fit
                            px-2.5 py-1
                            text-xs font-medium rounded-full
                            ${
                              p.paymentMethod === "COD"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          `}
                        >
                          {p.paymentMethod}
                        </span>

                        {/* RAZORPAY SHORT */}
                        {p.razorpayOrderId && (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-400 truncate max-w-[120px]">
                              {p.razorpayOrderId}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                navigator.clipboard.writeText(
                                  p.razorpayOrderId
                                );
                              }}
                              className="
                                    text-[10px]
                                    text-blue-600
                                    hover:text-blue-800
                                    hover:underline
                                    transition
                                  "
                            >
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="p-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-gray-700">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        <span className="text-gray-400">
                          {new Date(p.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 flex-wrap">
                        {/* VIEW */}
                        <button
                          onClick={() => onView(p)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-black text-white hover:bg-gray-800"
                        >
                          View
                        </button>

                        {/* PENDING */}
                        {p.paymentStatus === "PENDING" && (
                          <>
                            <button
                              onClick={() => onAction(p.id, "MARK_PAID")}
                              className="px-3 py-1.5 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              Paid
                            </button>

                            <button
                              onClick={() => onAction(p.id, "FAIL")}
                              className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Fail
                            </button>
                          </>
                        )}

                        {/* PAID */}
                        {p.paymentStatus === "PAID" && (
                          <button
                            onClick={() => onAction(p.id, "REFUND")}
                            className="px-3 py-1.5 text-xs rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
                          >
                            Refund
                          </button>
                        )}

                        {/* FAILED */}
                        {p.paymentStatus === "FAILED" && (
                          <button
                            onClick={() => onAction(p.id, "MARK_PAID")}
                            className="px-3 py-1.5 text-xs rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          >
                            Retry
                          </button>
                        )}

                        {/* REFUNDED */}
                        {p.paymentStatus === "REFUNDED" && (
                          <>
                            <button
                              onClick={() => onAction(p.id, "MARK_PAID")}
                              className="px-3 py-1.5 text-xs rounded-lg bg-green-100 text-green-700"
                            >
                              Paid
                            </button>

                            <button
                              onClick={() => onAction(p.id, "SET_PENDING")}
                              className="px-3 py-1.5 text-xs rounded-lg bg-yellow-100 text-yellow-700"
                            >
                              Pending
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
