"use client";

import { ReactNode } from "react";

interface BulkActionBarProps {
  icon: string;
  title: string;
  subtitle: string;
  count: number;
  children: ReactNode;
  onClear?: () => void;
}

export default function BulkActionBar({
  icon,
  title,
  subtitle,
  count,
  children,
  onClear,
}: BulkActionBarProps) {
  return (
    <div
      className="
        sticky lg:top-4 z-40

        rounded-2xl border
        border-gray-200

        bg-white/80 backdrop-blur-xl

        shadow-lg
        hover:shadow-xl

        transition-all

        px-4 py-3
      "
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl
              bg-gradient-to-br from-blue-50 to-blue-100
              text-xl
              shadow-sm
            "
          >
            {icon}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">
                {count} {title}
              </h2>
            </div>

            <p className="text-xs text-gray-500">{subtitle}</p>

            {onClear && (
              <button
                onClick={onClear}
                className="
                  text-xs text-red-500
                  hover:text-red-600
                  font-medium
                  transition
                "
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="
            flex flex-wrap gap-2
            lg:justify-end
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}