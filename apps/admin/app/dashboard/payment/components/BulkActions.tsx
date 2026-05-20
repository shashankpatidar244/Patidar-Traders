"use client"

export default function BulkActions({
  selectedIds,
  onBulkAction,
  clearSelection,
}: any) {
  if (selectedIds.length === 0) return null

  return (
    <div className="bg-gray-50 border rounded-xl px-4 py-3 flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-800">
          {selectedIds.length} selected
        </span>

        <button
          onClick={clearSelection}
          className="text-xs text-gray-500 hover:text-black underline"
        >
          Clear
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onBulkAction("MARK_PAID")}
          className="px-3 py-1 text-xs rounded bg-green-100 text-green-700"
        >
          Paid
        </button>

        <button
          onClick={() => onBulkAction("REFUND")}
          className="px-3 py-1 text-xs rounded bg-red-100 text-red-700"
        >
          Refund
        </button>

        <button
          onClick={() => onBulkAction("SET_PENDING")}
          className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-700"
        >
          Pending
        </button>
      </div>
    </div>
  )
}