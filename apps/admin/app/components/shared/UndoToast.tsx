"use client";

import { useEffect, useMemo, useState } from "react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  expiresAt: number;
  onExpire?: () => void;
}

export default function UndoToast({
  message,
  onUndo,
  expiresAt,
  onExpire,
}: UndoToastProps) {
  const totalDuration = useMemo(
    () => Math.max(1, expiresAt - Date.now()),
    [expiresAt]
  );

  const [remainingMs, setRemainingMs] = useState(
    Math.max(0, expiresAt - Date.now())
  );

  useEffect(() => {
    let expired = false;
  
    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt - Date.now());
  
      setRemainingMs(remaining);
  
      if (remaining <= 0 && !expired) {
        expired = true;
  
        clearInterval(interval);
  
        setRemainingMs(0);
  
        onExpire?.();
      }
    }, 250);
  
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const seconds = Math.ceil(remainingMs / 1000);

  const progress = Math.max(0, (remainingMs / totalDuration) * 100);

  const expired = remainingMs <= 0;

  return (
    <div
      className="
        min-w-[320px]
        max-w-md
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-xl
      "
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-green-100
            text-lg
          "
        >
          ✓
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900">Changes Saved</div>

          <div className="mt-1 text-sm text-gray-600">{message}</div>

          <div className="mt-3 flex items-center gap-3">
            <span
              className="
                rounded-full
                bg-gray-100
                px-2.5
                py-1
                text-xs
                font-medium
                text-gray-700
              "
            >
              {seconds}s
            </span>

            <button
              disabled={expired}
              onClick={onUndo}
              className="
                rounded-lg
                bg-blue-600
                px-3
                py-1.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:bg-gray-300
              "
            >
              Undo
            </button>
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-gray-100">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: progress > 30 ? "#2563eb" : "#ef4444",
          }}
        />
      </div>
    </div>
  );
}
