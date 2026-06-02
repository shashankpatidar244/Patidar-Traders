"use client";

import { useCallback, useMemo, useState } from "react";
import toast, { type Toast } from "react-hot-toast";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import UndoToast from "../../../components/shared/UndoToast";
import BulkActionBar from "../../../components/shared/BulkActionBar";
import BulkActionButton from "../../../components/shared/BulkActionButton";
import { exportCSV } from "../../../lib/exportCsv";

export enum PaymentBulkAction {
  MARK_PAID = "MARK_PAID",
  REFUND = "REFUND",
  SET_PENDING = "SET_PENDING",
  FAIL = "FAIL",
}

interface PaymentRow {
  id: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  createdAt: string;
}

interface BulkActionsProps {
  selectedIds: number[];

  payments: PaymentRow[];

  onBulkAction: (action: PaymentBulkAction) => Promise<void> | void;

  clearSelection: () => void;

  refresh: () => Promise<void>;
}

export default function BulkActions({
  selectedIds,
  payments,
  onBulkAction,
  clearSelection,
  refresh,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState<PaymentBulkAction | null>(
    null
  );

  const selectedCount = useMemo(() => selectedIds.length, [selectedIds]);

  const selectedPayments = useMemo(
    () => payments.filter((payment) => selectedIds.includes(payment.id)),
    [payments, selectedIds]
  );

  const previousStatuses = useMemo(
    () =>
      payments
        .filter((payment) => selectedIds.includes(payment.id))
        .map((payment) => ({
          id: payment.id,
          paymentStatus: payment.paymentStatus,
        })),
    [payments, selectedIds]
  );

  const executeAction = useCallback(
    async (action: PaymentBulkAction) => {
      try {
        setLoading(true);

        toast.loading("Updating payments...", {
          id: "payment-bulk",
        });

        await onBulkAction(action);

        toast.success(`${selectedCount} payments updated`, {
          id: "payment-bulk",
        });

        if (
          action === PaymentBulkAction.MARK_PAID ||
          action === PaymentBulkAction.FAIL ||
          action === PaymentBulkAction.SET_PENDING
        ) {
          const undoExpiresAt = Date.now() + 60000;
          toast.custom(
            (t: Toast) => (
              <UndoToast
                message="Payment status updated"
                expiresAt={undoExpiresAt}
                onExpire={() => {
                  toast.remove(t.id);
                }}
                onUndo={async () => {
                  toast.remove(t.id);

                  try {
                    toast.loading("Reverting changes...", {
                      id: "undo-payment",
                    });

                    const res = await fetch("/api/payment/bulk", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        undo: true,
                        previousStatuses,
                      }),
                    });

                    const result = await res.json();

                    if (!res.ok) {
                      throw new Error(result.error);
                    }

                    toast.success("Changes reverted", {
                      id: "undo-payment",
                    });

                    await refresh();
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Undo failed",
                      {
                        id: "undo-payment",
                      }
                    );
                  }
                }}
              />
            ),
            {
              duration: 60000,
            }
          );
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update payments",
          {
            id: "payment-bulk",
          }
        );
      } finally {
        setLoading(false);
      }
    },
    [onBulkAction, selectedCount, previousStatuses, refresh]
  );

  if (!selectedCount) {
    return null;
  }

  return (
    <>
      <BulkActionBar
        icon="💳"
        title="Payments Selected"
        subtitle="Apply bulk actions on selected payments"
        count={selectedCount}
        onClear={clearSelection}
      >
        <BulkActionButton
          icon="✅"
          label="Mark Paid"
          color="green"
          loading={loading}
          onClick={() => executeAction(PaymentBulkAction.MARK_PAID)}
        />

        <BulkActionButton
          icon="⏳"
          label="Set Pending"
          color="yellow"
          loading={loading}
          onClick={() => executeAction(PaymentBulkAction.SET_PENDING)}
        />

        <BulkActionButton
          icon="❌"
          label="Mark Failed"
          color="red"
          loading={loading}
          onClick={() => {
            setPendingAction(PaymentBulkAction.FAIL);
            setConfirmOpen(true);
          }}
        />

        <BulkActionButton
          icon="↩️"
          label="Refund"
          color="red"
          loading={loading}
          onClick={() => {
            setPendingAction(PaymentBulkAction.REFUND);
            setConfirmOpen(true);
          }}
        />

        <BulkActionButton
          icon="📄"
          label="Export CSV"
          color="blue"
          disabled={!selectedPayments.length}
          loading={loading}
          onClick={() => {
            exportCSV(
              selectedPayments.map((payment) => ({
                ID: payment.id,
                Status: payment.paymentStatus,
                Method: payment.paymentMethod,
                CreatedAt: payment.createdAt,
              })),
              `payments-${Date.now()}.csv`
            );

            toast.success(`${selectedPayments.length} payments exported`);
          }}
        />
      </BulkActionBar>

      <ConfirmModal
        open={confirmOpen}
        title={
          pendingAction === PaymentBulkAction.REFUND
            ? "Refund Payments"
            : "Mark Payments Failed"
        }
        description={`Apply this action to ${selectedCount} selected payments?`}
        confirmText="Confirm"
        loading={loading}
        onClose={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={() => {
          setConfirmOpen(false);

          if (pendingAction) {
            executeAction(pendingAction);
          }

          setPendingAction(null);
        }}
      />
    </>
  );
}
