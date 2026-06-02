"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import BulkActionBar from "../../../components/shared/BulkActionBar";
import BulkActionButton from "../../../components/shared/BulkActionButton";
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

interface BulkActionsProps {
  selected: number[];
  orders: OrderRow[];
  refresh: () => Promise<void>;
  clearSelection: () => void;
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
  clearSelection,
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

  if (!selected.length) return null;

  return (
    <>
      <BulkActionBar
        icon="📦"
        title="Orders Selected"
        subtitle="Apply bulk actions on selected orders"
        count={selected.length}
        onClear={clearSelection}
      >
        {currentStatus === "PENDING" && (
          <BulkActionButton
            icon="✅"
            label="Confirm Orders"
            color="blue"
            loading={loading}
            onClick={() => runAction(BulkOrderAction.CONFIRM)}
          />
        )}

        {currentStatus === "CONFIRMED" && (
          <BulkActionButton
            icon="📦"
            label="Mark Packed"
            color="blue"
            loading={loading}
            onClick={() => runAction(BulkOrderAction.PACK)}
          />
        )}

        {currentStatus === "PACKED" && (
          <>
            <BulkActionButton
              icon="🚚"
              label="Mark Shipped"
              color="blue"
              loading={loading}
              onClick={() => runAction(BulkOrderAction.SHIP)}
            />

            <BulkActionButton
              icon="🛵"
              label="Out For Delivery"
              color="yellow"
              loading={loading}
              onClick={() => runAction(BulkOrderAction.OUT_FOR_DELIVERY)}
            />

            <BulkActionButton
              icon="📍"
              label="Delivered"
              color="green"
              loading={loading}
              onClick={() => runAction(BulkOrderAction.DELIVER)}
            />
          </>
        )}

        {currentStatus === "PACKED" && allDelivered && (
          <BulkActionButton
            icon="🎉"
            label="Complete Orders"
            color="green"
            loading={loading}
            onClick={() => runAction(BulkOrderAction.COMPLETE)}
          />
        )}

        {currentStatus === "COMPLETED" && (
          <BulkActionButton
            icon="✅"
            label="Orders Completed"
            color="green"
            disabled
            onClick={() => {}}
          />
        )}

        {currentStatus === "CANCELLED" && (
          <BulkActionButton
            icon="🚫"
            label="Orders Cancelled"
            color="red"
            disabled
            onClick={() => {}}
          />
        )}

        {currentStatus !== "COMPLETED" && currentStatus !== "CANCELLED" && (
          <BulkActionButton
            icon="❌"
            label="Cancel Orders"
            color="red"
            loading={loading}
            onClick={() => setConfirmOpen(true)}
          />
        )}

        <BulkActionButton
          icon="📄"
          label="Export CSV"
          color="gray"
          loading={loading}
          onClick={exportOrders}
        />
      </BulkActionBar>

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
