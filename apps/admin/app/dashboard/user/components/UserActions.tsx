"use client"

import { useState } from "react"

export default function UserActions({ user }: any) {
  const [loading, setLoading] = useState(false)

  const run = async (action: string) => {
    try {
      setLoading(true)

      const res = await fetch("/api/user/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          action,
        }),
      })

      if (!res.ok) {
        throw new Error("Action failed")
      }

      // 🔥 Better than reload (refresh data)
      window.location.reload()

    } catch (err) {
      alert("Something went wrong ❌")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 justify-end">

      {/* BLOCK / UNBLOCK */}
      <button
        disabled={loading}
        onClick={() =>
          run(user.isBlocked ? "UNBLOCK" : "BLOCK")
        }
        className={`px-3 py-1 text-xs rounded transition ${
          user.isBlocked
            ? "bg-green-100 text-green-600 hover:bg-green-200"
            : "bg-red-100 text-red-600 hover:bg-red-200"
        } ${loading && "opacity-50 cursor-not-allowed"}`}
      >
        {loading
          ? "..."
          : user.isBlocked
          ? "Unblock"
          : "Block"}
      </button>

      {/* PROMOTE / DEMOTE */}
      <button
        disabled={loading}
        onClick={() =>
          run(user.role === "ADMIN" ? "DEMOTE" : "PROMOTE")
        }
        className={`px-3 py-1 text-xs rounded transition ${
          user.role === "ADMIN"
            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
        } ${loading && "opacity-50 cursor-not-allowed"}`}
      >
        {loading
          ? "..."
          : user.role === "ADMIN"
          ? "Demote"
          : "Promote"}
      </button>

    </div>
  )
}