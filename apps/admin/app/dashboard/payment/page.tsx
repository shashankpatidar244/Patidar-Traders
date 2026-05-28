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
import SearchFilterBar, { FilterField } from "../components/SearchFilterBar";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const currentLimit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";

  const status = searchParams.get("status") || "";

  const method = searchParams.get("method") || "";

  const sort = searchParams.get("sort") || "newest";

  const [selected, setSelected] = useState<any>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // FILTER
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "status",

        label: "Payment Status",

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

        label: "Payment Method",

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

        label: "Sort By",

        isSortEngine: true,

        options: [
          {
            label: "Newest First",
            value: "newest",
          },

          {
            label: "Oldest First",
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

  // FETCH
  const { data, meta, loading, refetch } = usePayments({
    search,
    status,
    method,
    sort,
    page,
    limit: currentLimit,
  });

  async function handleBulkAction(action: string) {
    try {
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
    } catch (error) {
      console.error("BULK PAYMENT ACTION ERROR:", error);
    }
  }

  async function handleAction(id: number, action: string) {
    try {
      const res = await fetch("/api/payment", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
          action,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update payment");
      }

      // WAIT FOR REFRESH
      await refetch();

      // UPDATE MODAL DATA
      if (selected?.id === id) {
        const refreshed = await fetch(`/api/payment/${id}`, {
          cache: "no-store",
        });

        const updatedPayment = await refreshed.json();

        setSelected(updatedPayment);
      }
    } catch (error) {
      console.error("PAYMENT ACTION ERROR:", error);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

          <p className="text-sm text-gray-500 mt-1">
            Track transactions, refunds, failed payments and Razorpay activity
          </p>
        </div>

        {/* TOTAL COUNT */}
        <div className="flex items-center gap-3">
          <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Total Payments
            </p>

            <p className="text-xl font-bold text-gray-900">
              {meta?.total || 0}
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <PaymentStats data={data} />

      {/* FILTER BAR */}
      <SearchFilterBar
        fields={filterFields}
        globalSearchKey="search"
        globalSearchPlaceholder="Search by payment ID, Razorpay order ID or payment ID..."
      />

      {/* BULK ACTIONS */}
      <BulkActions
        selectedIds={selectedIds}
        onBulkAction={handleBulkAction}
        clearSelection={() => setSelectedIds([])}
      />

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
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
              onView={(payment: any) => setSelected(payment)}
            />
          </>
        )}
      </div>

      {/* PAGINATION */}
      <Pagination
        title="Payments"
        page={page}
        totalPages={meta?.totalPages || 1}
        currentLimit={currentLimit}
      />

      {/* PAYMENT MODAL */}
      <PaymentModal
        payment={selected}
        onClose={() => setSelected(null)}
        onAction={handleAction}
      />
    </div>
  );
}
