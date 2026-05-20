"use client";

import { FileWarning, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function ErrorBox({ errors }: { errors: string[] }) {
  const [open, setOpen] = useState(true);

  if (!errors.length) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/40 rounded-2xl shadow-sm">

      {/* HEADER */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between p-4 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-red-600">
          <FileWarning size={18} />
          <p className="text-sm font-semibold">
            Errors Found ({errors.length})
          </p>
        </div>

        {open ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </div>

      {/* ERROR LIST */}
      {open && (
        <div className="px-4 pb-4">
          <div className="max-h-48 overflow-y-auto border-t border-gray-100 dark:border-gray-700 pt-3">

            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {errors.map((e, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20"
                >
                  <span className="text-red-500 mt-0.5">•</span>
                  <span className="break-words">{e}</span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      )}
    </div>
  );
}