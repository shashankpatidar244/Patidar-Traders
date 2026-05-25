"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePayments } from "./hooks/usePayments";
import PaymentTable from "./components/PaymentTable";
import PaymentStats from "./components/PaymentStats";
import PaymentModal from "./components/PaymentModal";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "./components/Skeleton";
import BulkActions from "./components/BulkActions";
import SearchFilterBar, {
  FilterField,
} from "../components/SearchFilterBar";

export default function PaymentPage() {

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const currentLimit = Number( searchParams.get("limit") || 10 );
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const method = searchParams.get("method") || "";
  const sort = searchParams.get("sort") || "newest";
  const [selected, setSelected] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // FILTER CONFIG
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "status",

        label: "Status",

        options: [
          {
            label: "Pending",
            value: "PENDING",
          },

          {
            label: "Paid",
            value: "PAID",
          },

          {
            label: "Failed",
            value: "FAILED",
          },

          {
            label: "Refunded",
            value: "REFUNDED",
          },
        ],
      },

      {
        key: "method",

        label: "Method",

        options: [
          {
            label: "COD",
            value: "COD",
          },

          {
            label: "UPI",
            value: "UPI",
          },

          {
            label: "CARD",
            value: "CARD",
          },
        ],
      },

      {
        key: "sort",

        label: "Sort",

        isSortEngine: true,

        options: [
          {
            label: "Newest",
            value: "newest",
          },

          {
            label: "Oldest",
            value: "oldest",
          },

          {
            label: "Highest Amount",
            value: "amount_desc",
          },

          {
            label: "Lowest Amount",
            value: "amount_asc",
          },
        ],
      },
    ],
    []
  );

  // FETCH DATA
  const {
    data,
    meta,
    loading,
    refetch,
  } = usePayments({
    search,
    status,
    method,
    sort,
    page,
    limit: currentLimit,
  });

  // BULK ACTION
  const handleBulkAction = async (
    action: string
  ) => {
    await fetch("/api/payment/bulk", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ids: selectedIds,
        action,
      }),
    });

    setSelectedIds([]);

    refetch();
  };

  // SINGLE ACTION
  const handleAction = async (
    id: number,
    action: string
  ) => {
    await fetch("/api/payment", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        id,
        action,
      }),
    });

    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">
            Manage and track all transactions
          </p>
        </div>
      </div>

      {/* Stats */}
      <PaymentStats data={data} />

      {/* Filters */}
      <SearchFilterBar
        fields={filterFields}
        globalSearchKey="search"
        globalSearchPlaceholder="Search by payment ID or Razorpay order ID..."
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
            <Pagination
                title="Payments"
                page={page}
                totalPages={
                  meta?.totalPages || 1
                }
                currentLimit={currentLimit}
              />
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
  );
}
