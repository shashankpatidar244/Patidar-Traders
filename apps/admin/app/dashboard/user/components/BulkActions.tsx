"use client"

import { useState } from "react"

export default function BulkActions({
  selected,
  users,
}: {
  selected: number[]
  users: any[]
}) {
  const [loading, setLoading] = useState(false)

  if (!selected.length) return null

  const run = async (action: string) => {
    try {
      setLoading(true)

      const res = await fetch("/api/user/bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selected,
          action,
        }),
      })

      if (!res.ok) throw new Error("Failed")

      window.location.reload()
    } catch (err) {
      alert("Something went wrong ❌")
    } finally {
      setLoading(false)
    }
  }

  // ================= EXPORT CSV =================
  const exportCSV = () => {
    const selectedUsers = users.filter((u) =>
      selected.includes(u.id)
    )

    const csv = [
      ["ID", "Name", "Phone", "Role", "Orders", "Spend"],
      ...selectedUsers.map((u) => [
        u.id,
        u.username,
        u.phone,
        u.role,
        u.totalOrders,
        u.totalSpend,
      ]),
    ]

    const blob = new Blob(
      [csv.map((r) => r.join(",")).join("\n")],
      { type: "text/csv" }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
  }

  return (
    <div className="sticky top-4 z-20 bg-white border shadow-sm rounded-xl px-4 py-3 flex items-center justify-between">

      {/* LEFT */}
      <div className="text-sm font-medium text-gray-700">
        {selected.length} selected
      </div>

      {/* RIGHT */}
      <div className="flex gap-2">

        {/* BLOCK */}
        <button
          disabled={loading}
          onClick={() => run("BLOCK")}
          className="px-3 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
        >
          Block
        </button>

        {/* UNBLOCK */}
        <button
          disabled={loading}
          onClick={() => run("UNBLOCK")}
          className="px-3 py-1 text-xs rounded bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50"
        >
          Unblock
        </button>

        {/* EXPORT */}
        <button
          onClick={exportCSV}
          className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
        >
          Export CSV
        </button>
      </div>
    </div>
  )
}