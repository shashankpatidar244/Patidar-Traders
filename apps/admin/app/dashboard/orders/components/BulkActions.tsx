"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import { exportCSV } from "../../../lib/exportCsv";

interface OrderRow {
  id: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;

  total?: number;
  paymentStatus?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt?: string;
}

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "COMPLETED"
  | "CANCELLED";

type DeliveryStatus =
  | "PENDING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

interface OrderRow {
  id: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
}

interface BulkActionsProps {
  selected: number[];
  orders: OrderRow[];
  refresh: () => Promise<void>;
}

enum BulkOrderAction {
  CONFIRM = "CONFIRM",
  PACK = "PACK",
  SHIP = "SHIP",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVER = "DELIVER",
  COMPLETE = "COMPLETE",
  CANCEL = "CANCEL",
}

export default function BulkActions({
  selected,
  orders,
  refresh,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedOrders = useMemo(
    () => orders.filter((order) => selected.includes(order.id)),
    [orders, selected]
  );

  const currentStatus = selectedOrders[0]?.status;

  const allDelivered = useMemo(
    () => selectedOrders.every((order) => order.deliveryStatus === "DELIVERED"),
    [selectedOrders]
  );

  const runAction = useCallback(
    async (action: BulkOrderAction) => {
      try {
        setLoading(true);

        toast.loading("Processing orders...", {
          id: "orders-bulk",
        });

        const res = await fetch("/api/orders/bulk", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderIds: selected,
            action,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Bulk action failed");
        }

        await refresh();

        toast.success(data.message || "Orders updated", {
          id: "orders-bulk",
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
          {
            id: "orders-bulk",
          }
        );
      } finally {
        setLoading(false);
      }
    },
    [refresh, selected]
  );

  const exportOrders = useCallback(() => {
    exportCSV(
      selectedOrders.map((order) => ({
        OrderID: order.id,
        Customer: order.customerName ?? "",
        Phone: order.customerPhone ?? "",
        Status: order.status,
        DeliveryStatus: order.deliveryStatus,
        PaymentStatus: order.paymentStatus ?? "",
        Total: order.total ?? "",
        CreatedAt: order.createdAt ?? "",
      })),
      `orders-${Date.now()}.csv`
    );

    toast.success(`${selectedOrders.length} orders exported`);
  }, [selectedOrders]);

  const badgeClass = useMemo(() => {
    switch (currentStatus) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PACKED":
        return "bg-indigo-100 text-indigo-700";

      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }, [currentStatus]);

  if (!selected.length) return null;

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <>
      <div
        className="
          sticky
          top-4
          z-40
          rounded-2xl
          border
          border-gray-200
          bg-white/95
          backdrop-blur
          shadow-lg
          p-4
        "
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
              📦
            </div>

            <div>
              <div className="font-semibold text-gray-900">
                {selected.length} Orders Selected
              </div>

              <div className="text-xs text-gray-500">Bulk workflow actions</div>

              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                >
                  {currentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-2">
            {currentStatus === "PENDING" && (
              <button
                disabled={loading}
                aria-label="Confirm Orders"
                onClick={() => runAction(BulkOrderAction.CONFIRM)}
                className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}
              >
                {loading ? "Processing..." : "Confirm Orders"}
              </button>
            )}

            {currentStatus === "CONFIRMED" && (
              <button
                disabled={loading}
                aria-label="Mark Packed"
                onClick={() => runAction(BulkOrderAction.PACK)}
                className={`${buttonClass} bg-indigo-600 hover:bg-indigo-700`}
              >
                {loading ? "Processing..." : "Mark Packed"}
              </button>
            )}

            {currentStatus === "PACKED" && (
              <>
                <button
                  disabled={loading}
                  aria-label="Mark Shipped"
                  onClick={() => runAction(BulkOrderAction.SHIP)}
                  className={`${buttonClass} bg-sky-600 hover:bg-sky-700`}
                >
                  Mark Shipped
                </button>

                <button
                  disabled={loading}
                  aria-label="Out For Delivery"
                  onClick={() => runAction(BulkOrderAction.OUT_FOR_DELIVERY)}
                  className={`${buttonClass} bg-violet-600 hover:bg-violet-700`}
                >
                  Out For Delivery
                </button>

                <button
                  disabled={loading}
                  aria-label="Mark Delivered"
                  onClick={() => runAction(BulkOrderAction.DELIVER)}
                  className={`${buttonClass} bg-emerald-600 hover:bg-emerald-700`}
                >
                  Mark Delivered
                </button>
              </>
            )}

            {currentStatus === "PACKED" && allDelivered && (
              <button
                disabled={loading}
                aria-label="Complete Orders"
                onClick={() => runAction(BulkOrderAction.COMPLETE)}
                className={`${buttonClass} bg-green-600 hover:bg-green-700`}
              >
                Complete Orders
              </button>
            )}

            {currentStatus !== "COMPLETED" && currentStatus !== "CANCELLED" && (
              <button
                disabled={loading}
                aria-label="Cancel Orders"
                onClick={() => setConfirmOpen(true)}
                className={`${buttonClass} bg-red-600 hover:bg-red-700`}
              >
                Cancel Orders
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={loading}
            aria-label="Export Orders CSV"
            onClick={exportOrders}
            className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-700
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-white
                        shadow-sm
                        transition-all
                        hover:bg-slate-800
                        hover:shadow-md
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
          >
            Export CSV
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Cancel Orders"
        description={`Are you sure you want to cancel ${selected.length} selected orders? This may restore inventory and refund payments.`}
        confirmText="Cancel Orders"
        loading={loading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          runAction(BulkOrderAction.CANCEL);
        }}
      />
    </>
  );
}
