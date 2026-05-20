"use client"

import { Search } from "lucide-react"

export default function OrderFilters({ setFilters }: any) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-center">

      {/* 🔍 SEARCH */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

        <input
          placeholder="Search by Order ID / Name / Phone..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            setFilters((p: any) => ({
              ...p,
              search: e.target.value,
            }))
          }
        />
      </div>

      {/* 📦 STATUS FILTER */}
      <select
        className="w-full md:w-48 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) =>
          setFilters((p: any) => ({
            ...p,
            status: e.target.value,
          }))
        }
      >
        <option value="">All Status</option>
        <option value="PENDING">🟡 Pending</option>
        <option value="PAID">🔵 Paid</option>
        <option value="SHIPPED">🟣 Shipped</option>
        <option value="DELIVERED">🟢 Delivered</option>
        <option value="CANCELLED">🔴 Cancelled</option>
      </select>

    </div>
  )
}