"use client"

import { useEffect, useState } from "react"

export default function PaymentFilters({ setQuery }: any) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [method, setMethod] = useState("")

  // 🔥 Auto apply filters (debounce)
  useEffect(() => {
    const delay = setTimeout(() => {
      const q = `search=${search}&status=${status}&method=${method}`
      setQuery(q)
    }, 400)

    return () => clearTimeout(delay)
  }, [search, status, method])

  const resetFilters = () => {
    setSearch("")
    setStatus("")
    setMethod("")
    setQuery("")
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">

      <div className="flex flex-wrap items-center gap-3">

        {/* 🔍 Search */}
        <div className="flex items-center border rounded-lg px-3 py-2 w-72 bg-gray-50 focus-within:ring-2 focus-within:ring-black/20">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order / Razorpay ID"
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        {/* 📊 Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-black/20"
        >
          <option value="">All Status</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>

        {/* 💳 Method */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-black/20"
        >
          <option value="">All Methods</option>
          <option value="COD">COD</option>
          <option value="ONLINE">ONLINE</option>
        </select>

        {/* 🔄 Reset */}
        <button
          onClick={resetFilters}
          className="ml-auto text-sm text-gray-500 hover:text-black underline"
        >
          Reset
        </button>
      </div>
    </div>
  )
}