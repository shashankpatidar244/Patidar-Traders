export default function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-5">
        💳
      </div>
      <h2 className="text-xl font-semibold text-gray-900">No Payments Found</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
        {message ||
          "No payment records match your current filters, search, or payment status."}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
        <span className="px-3 py-1 rounded-full bg-gray-100">
          Try different filters
        </span>

        <span className="px-3 py-1 rounded-full bg-gray-100">
          Search by Order ID
        </span>

        <span className="px-3 py-1 rounded-full bg-gray-100">
          Change payment status
        </span>
      </div>
    </div>
  );
}
