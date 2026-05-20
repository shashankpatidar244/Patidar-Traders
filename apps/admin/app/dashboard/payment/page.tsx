"use client"

import { useState } from "react"
import { usePayments } from "./hooks/usePayments"
import PaymentTable from "./components/PaymentTable"
import PaymentFilters from "./components/PaymentFilters"
import PaymentStats from "./components/PaymentStats"
import PaymentModal from "./components/PaymentModal"
import Pagination from "./components/Pagination"
import { TableSkeleton } from "./components/Skeleton"
import BulkActions from "./components/BulkActions"

export default function PaymentPage() {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data, meta, loading, refetch } = usePayments(query, page)

  const handleBulkAction = async (action: string) => {
    await fetch("/api/payment/bulk", {
      method: "POST",
      body: JSON.stringify({ ids: selectedIds, action }),
    })
  
    setSelectedIds([])
    refetch()
  }

  const handleAction = async (id: number, action: string) => {
    await fetch("/api/payment", {
      method: "POST",
      body: JSON.stringify({ id, action }),
    })
    refetch()
  }

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Payments
          </h1>
          <p className="text-sm text-gray-500">
            Manage and track all transactions
          </p>
        </div>
      </div>

      {/* Stats */}
      <PaymentStats data={data} />

    
      {/* Filters */}
      <PaymentFilters
        setQuery={(q: string) => {
          setQuery(q)
          setPage(1)
        }}
      />

       <BulkActions
        selectedIds={selectedIds}
        onBulkAction={handleBulkAction}
        clearSelection={() => setSelectedIds([])}
       />

      {/* Table Section */}
      <div className="bg-white border rounded-xl shadow-sm">

        {loading ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : (
          <>
            <PaymentTable
                data={data}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                onAction={handleAction}
                onView={(p: any) => setSelected(p)}
            />

            {/* Pagination */}
            <div className="p-4 border-t">
              <Pagination meta={meta} setPage={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <PaymentModal
        payment={selected}
        onClose={() => setSelected(null)}
        onAction={handleAction}
      />
    </div>
  )
}