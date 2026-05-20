"use client"

import { useEffect, useState } from "react"
import CategorySelect from "./CategorySelect"

interface Props {
  id: number
  onClose: () => void
  refresh: () => void
}

export default function DeleteModal({ id, onClose, refresh }: Props) {
  const [moveTo, setMoveTo] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasProducts, setHasProducts] = useState(false)

  // ✅ Check if category has products
  useEffect(() => {
    const checkProducts = async () => {
      const res = await fetch(`/api/category?limit=100`)
      const data = await res.json()

      const current = data.data.find((c: any) => c.id === id)
      if (current?._count?.products > 0) {
        setHasProducts(true)
      }
    }

    checkProducts()
  }, [id])

  const handleDelete = async () => {
    setError("")

    // 🚨 FORCE SELECT if products exist
    if (hasProducts && !moveTo) {
      setError("Please select a category to move products.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/category/${id}`, {
        method: "DELETE",
        body: JSON.stringify({
          moveToCategoryId: moveTo,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      refresh()
      onClose()
    } catch {
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-3">
          Delete Category
        </h2>

        {/* Warning */}
        {hasProducts ? (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            ⚠ This category contains products. You must move them before deleting.
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-4">
            This category has no products. Safe to delete.
          </p>
        )}

        {/* Category Select */}
        {hasProducts && (
          <CategorySelect
            value={moveTo}
            onChange={setMoveTo}
            placeholder="Move products to..."
          />
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}