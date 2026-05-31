"use client";

import { useCallback, useMemo, useState } from "react";
import toast, { type Toast } from "react-hot-toast";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import UndoToast from "../../../components/shared/UndoToast";
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

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2";

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
          px-5
          py-4
          shadow-lg
        "
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-black
                text-white
                text-sm
                font-bold
              "
            >
              {selectedCount}
            </div>

            <div>
              <div className="font-semibold text-gray-900">
                {selectedCount} Payments Selected
              </div>

              <div className="text-xs text-gray-500">
                Apply bulk payment actions
              </div>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="
                text-xs
                text-gray-500
                underline
                transition
                hover:text-black
              "
            >
              Clear Selection
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              aria-label="Mark Payments Paid"
              onClick={() => executeAction(PaymentBulkAction.MARK_PAID)}
              className={`${buttonClass} bg-green-100 text-green-700 hover:bg-green-200`}
            >
              {loading ? "Processing..." : "Mark Paid"}
            </button>

            <button
              type="button"
              disabled={loading}
              aria-label="Set Payments Pending"
              onClick={() => executeAction(PaymentBulkAction.SET_PENDING)}
              className={`${buttonClass} bg-yellow-100 text-yellow-700 hover:bg-yellow-200`}
            >
              {loading ? "Processing..." : "Set Pending"}
            </button>

            <button
              type="button"
              disabled={loading}
              aria-label="Mark Payments Failed"
              onClick={() => {
                setPendingAction(PaymentBulkAction.FAIL);

                setConfirmOpen(true);
              }}
              className={`${buttonClass} bg-red-100 text-red-700 hover:bg-red-200`}
            >
              {loading ? "Processing..." : "Mark Failed"}
            </button>

            <button
              type="button"
              disabled={loading}
              aria-label="Refund Payments"
              onClick={() => {
                setPendingAction(PaymentBulkAction.REFUND);

                setConfirmOpen(true);
              }}
              className={`${buttonClass} bg-orange-100 text-orange-700 hover:bg-orange-200`}
            >
              {loading ? "Processing..." : "Refund"}
            </button>
          </div>

          <button
            type="button"
            disabled={!selectedPayments.length}
            aria-label="Export Payments"
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
            className={`${buttonClass} bg-blue-100 text-blue-700 hover:bg-blue-200`}
          >
            Export CSV
          </button>
        </div>
      </div>

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
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);

          if (pendingAction) {
            executeAction(pendingAction);
          }
        }}
      />
    </>
  );
}
