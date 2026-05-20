"use client"

import { useState } from "react"

interface Category {
  id: number
  name: string
}

interface Props {
  data?: Category | null
  onClose: () => void
  refresh: () => void
}

export default function CategoryForm({ data, onClose, refresh }: Props) {
  const [name, setName] = useState(data?.name || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    const trimmed = name.trim()

    // ✅ validation
    if (!trimmed) {
      setError("Category name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch(
        data ? `/api/category/${data.id}` : "/api/category",
        {
          method: data ? "PATCH" : "POST",
          body: JSON.stringify({ name: trimmed }),
        }
      )

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || "Something went wrong")
        setLoading(false)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold mb-4">
          {data ? "Edit" : "Add"} Category
        </h2>

        {/* Input */}
        <input
          placeholder="Category name..."
          className="border w-full p-2 mb-3 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}