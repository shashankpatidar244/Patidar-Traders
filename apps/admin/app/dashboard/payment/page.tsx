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
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const paymentMethod = searchParams.get("paymentMethod") || "";
  const status = searchParams.get("status") || "";
  const deliveryStatus = searchParams.get("deliveryStatus") || "";
  const sort = searchParams.get("sort") || "newest";

  const [selected, setSelected] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // FILTER
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "paymentStatus",

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
        key: "paymentMethod",

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
        key: "deliveryStatus",

        label: "Delivery Status",

        options: [
          {
            label: "Pending",
            value: "PENDING",
          },

          {
            label: "Packed",
            value: "PACKED",
          },

          {
            label: "Shipped",
            value: "SHIPPED",
          },

          {
            label: "Out For Delivery",
            value: "OUT_FOR_DELIVERY",
          },

          {
            label: "Delivered",
            value: "DELIVERED",
          },

          {
            label: "Failed",
            value: "FAILED",
          },
        ],
      },

      {
        key: "status",
      
        label: "Order Status",
      
        options: [
          {
            label: "Pending",
            value: "PENDING",
          },
      
          {
            label: "Confirmed",
            value: "CONFIRMED",
          },
      
          {
            label: "Packed",
            value: "PACKED",
          },
      
          {
            label: "Completed",
            value: "COMPLETED",
          },
      
          {
            label: "Cancelled",
            value: "CANCELLED",
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
            value: "highest",
          },

          {
            label: "Lowest Amount",
            value: "lowest",
          },
        ],
      },
    ],
    []
  );

  // FETCH
  const { data, meta, loading, refetch } = usePayments({
    search,
    paymentStatus,
    paymentMethod,
    status,
    deliveryStatus,
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
        globalSearchPlaceholder="Search by order ID, Razorpay ID, phone or shipping name..."
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
