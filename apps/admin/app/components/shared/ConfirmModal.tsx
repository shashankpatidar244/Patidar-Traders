"use client"

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {description}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-4 py-2"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              {loading
                ? "Processing..."
                : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}