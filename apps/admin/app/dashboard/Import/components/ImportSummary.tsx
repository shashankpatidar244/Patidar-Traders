"use client";

import { CheckCircle, XCircle, BarChart3 } from "lucide-react";

export default function ImportSummary({
  summary,
}: {
  summary: { total: number; success: number; failed: number };
}) {
  if (!summary.total) return null;

  const successRate = Math.round(
    (summary.success / summary.total) * 100
  );

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-indigo-600" size={18} />
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Import Summary
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-3 gap-4">

        {/* TOTAL */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {summary.total}
          </p>
        </div>

        {/* SUCCESS */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 dark:bg-green-900/30">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle size={16} />
            <p className="text-xs">Success</p>
          </div>
          <p className="text-lg font-semibold text-green-700">
            {summary.success}
          </p>
        </div>

        {/* FAILED */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 dark:bg-red-900/30">
          <div className="flex items-center gap-1 text-red-600">
            <XCircle size={16} />
            <p className="text-xs">Failed</p>
          </div>
          <p className="text-lg font-semibold text-red-700">
            {summary.failed}
          </p>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Success Rate</span>
          <span>{successRate}%</span>
        </div>

        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

    </div>
  );
}