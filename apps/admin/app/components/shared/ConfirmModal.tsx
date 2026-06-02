"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  danger = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/50 backdrop-blur-sm
        p-4
        animate-in fade-in duration-200
      "
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
          w-full max-w-md
          rounded-3xl
          bg-white
          border border-gray-100
          shadow-2xl

          animate-in
          zoom-in-95
          slide-in-from-bottom-4
          duration-200
        "
      >
        <div className="p-6">
          {/* ICON */}
          <div
            className={`
              mb-4
              flex h-14 w-14 items-center justify-center
              rounded-2xl
              text-2xl
              ${
                danger
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-600"
              }
            `}
          >
            {danger ? "⚠️" : "ℹ️"}
          </div>

          {/* TITLE */}
          <h2 className="text-xl font-bold text-gray-900">
            {title}
          </h2>

          {/* DESCRIPTION */}
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {description}
          </p>

          {/* ACTIONS */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="
                flex-1
                rounded-xl
                border border-gray-200
                bg-white
                px-4 py-3
                text-sm font-medium
                text-gray-700
                hover:bg-gray-50
                transition
                disabled:opacity-50
              "
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`
                flex-1
                rounded-xl
                px-4 py-3
                text-sm font-semibold
                text-white
                transition
                disabled:opacity-50

                ${
                  danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}