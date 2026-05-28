"use client";

interface BulkActionsProps {
  selectedIds: number[];

  onBulkAction: (
    action: "MARK_PAID" | "REFUND" | "SET_PENDING" | "FAIL"
  ) => void;

  clearSelection: () => void;
}

export default function BulkActions({
  selectedIds,
  onBulkAction,
  clearSelection,
}: BulkActionsProps) {
  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
          {selectedIds.length}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {selectedIds.length} payments selected
          </span>

          <span className="text-xs text-gray-500">
            Apply bulk payment actions
          </span>
        </div>

        <button
          onClick={clearSelection}
          className="ml-2 text-xs text-gray-500 hover:text-black underline transition"
        >
          Clear
        </button>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex flex-wrap items-center gap-2">
        {/* MARK PAID */}
        <button
          onClick={() => onBulkAction("MARK_PAID")}
          className="px-4 py-2 text-xs font-medium rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition"
        >
          Mark Paid
        </button>

        {/* MARK FAILED */}
        <button
          onClick={() => onBulkAction("FAIL")}
          className="px-4 py-2 text-xs font-medium rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition"
        >
          Mark Failed
        </button>

        {/* REFUND */}
        <button
          onClick={() => onBulkAction("REFUND")}
          className="px-4 py-2 text-xs font-medium rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
        >
          Refund
        </button>

        {/* SET PENDING */}
        <button
          onClick={() => onBulkAction("SET_PENDING")}
          className="px-4 py-2 text-xs font-medium rounded-xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
        >
          Set Pending
        </button>
      </div>
    </div>
  );
}
