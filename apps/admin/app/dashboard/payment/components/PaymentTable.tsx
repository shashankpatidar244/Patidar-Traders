"use client"

import StatusBadge from "./StatusBadge"
import EmptyState from "./EmptyState"

export default function PaymentTable({
  data,
  onAction,
  onView,
  selectedIds,
  setSelectedIds,
}: any) {

  const isAllSelected =
    data.length > 0 && selectedIds.length === data.length

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.map((p: any) => p.id))
    }
  }

  const toggleRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i: number) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Header */}
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">

              {/* ✅ Select All */}
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
              </th>

              <th className="p-3 font-medium">ID</th>
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Method</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Razorpay</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              data.map((p: any) => {
                const isSelected = selectedIds.includes(p.id)

                return (
                  <tr
                    key={p.id}
                    className={`border-t transition cursor-pointer ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => onView(p)}
                  >
                    {/* ✅ Checkbox */}
                    <td
                      className="p-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(p.id)}
                      />
                    </td>

                    {/* ID */}
                    <td className="p-3 font-medium text-gray-900">
                      #{p.id}
                    </td>

                    {/* User */}
                    <td className="p-3 text-gray-700">
                      {p.user?.phone || "N/A"}
                    </td>

                    {/* Amount */}
                    <td className="p-3 font-semibold text-gray-900">
                      ₹{p.total}
                    </td>

                    {/* Method */}
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100">
                        {p.paymentMethod}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <StatusBadge status={p.paymentStatus} />
                    </td>

                    {/* Razorpay */}
                    <td className="p-3 text-xs text-gray-500">
                      {p.razorpayOrderId ? (
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[120px]">
                            {p.razorpayOrderId}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(p.razorpayOrderId)
                            }}
                            className="text-blue-500 hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-3 text-gray-600">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td
                      className="p-3 flex flex-wrap gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* View */}
                      <button
                        onClick={() => onView(p)}
                        className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        View
                      </button>

                      {/* PENDING */}
                      {p.paymentStatus === "PENDING" && (
                        <button
                          onClick={() => onAction(p.id, "MARK_PAID")}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Paid
                        </button>
                      )}

                      {/* PAID */}
                      {p.paymentStatus === "PAID" && (
                        <button
                          onClick={() => onAction(p.id, "REFUND")}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Refund
                        </button>
                      )}

                      {/* REFUNDED */}
                      {p.paymentStatus === "REFUNDED" && (
                        <>
                          <button
                            onClick={() => onAction(p.id, "MARK_PAID")}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                          >
                            Paid
                          </button>

                          <button
                            onClick={() => onAction(p.id, "SET_PENDING")}
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded"
                          >
                            Pending
                          </button>
                        </>
                      )}

                      {/* FAILED */}
                      {p.paymentStatus === "FAILED" && (
                        <button
                          onClick={() => onAction(p.id, "MARK_PAID")}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}