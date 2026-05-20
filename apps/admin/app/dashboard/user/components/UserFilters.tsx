"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function UserFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const [search, setSearch] = useState(params.get("search") || "")
  const [role, setRole] = useState(params.get("role") || "")
  const [status, setStatus] = useState(params.get("status") || "")

  // ================= UPDATE URL =================
  const updateURL = (newParams: any) => {
    const p = new URLSearchParams(params.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) p.set(key, value as string)
      else p.delete(key)
    })

    router.push(`?${p.toString()}`)
  }

  // ================= DEBOUNCE SEARCH =================
  useEffect(() => {
    const delay = setTimeout(() => {
      updateURL({ search })
    }, 500)

    return () => clearTimeout(delay)
  }, [search])

  // ================= HANDLE SELECT =================
  const handleRole = (value: string) => {
    setRole(value)
    updateURL({ role: value })
  }

  const handleStatus = (value: string) => {
    setStatus(value)
    updateURL({ status: value })
  }

  // ================= RESET =================
  const reset = () => {
    setSearch("")
    setRole("")
    setStatus("")
    router.push("/dashboard/user")
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap items-center gap-3">

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone..."
        className="px-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />

      {/* ROLE */}
      <select
        value={role}
        onChange={(e) => handleRole(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm focus:outline-none"
      >
        <option value="">All Roles</option>
        <option value="ADMIN">Admin</option>
        <option value="USER">User</option>
      </select>

      {/* STATUS */}
      <select
        value={status}
        onChange={(e) => handleStatus(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm focus:outline-none"
      >
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="BLOCKED">Blocked</option>
      </select>

      {/* RESET */}
      <button
        onClick={reset}
        className="ml-auto px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
      >
        Reset
      </button>
    </div>
  )
}