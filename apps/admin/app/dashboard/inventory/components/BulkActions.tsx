"use client";

import { memo, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import UndoToast from "../../../components/shared/UndoToast";
import BulkActionBar from "../../../components/shared/BulkActionBar";
import BulkActionButton from "../../../components/shared/BulkActionButton";
import { exportCSV } from "../../../lib/exportCsv";

interface Variant {
  id: number;
  stock: number;
  mrp?: number;
  sellingPrice?: number;
  value: string;
  unit: string;

  product?: {
    name: string;
  };
}

interface BulkActionsProps {
  selected: number[];
  data: Variant[];
  refresh: () => void;
  clearSelection: () => void;
}

enum InventoryBulkAction {
  ADD = "ADD",
  REDUCE = "REDUCE",
  SET = "SET",
}

interface SelectedVariant extends Variant {
  productName: string;
}

function BulkActions({
  selected,
  data,
  refresh,
  clearSelection,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<number>(1);
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<InventoryBulkAction | null>(null);

  const selectedVariants = useMemo(() => {
    return data.filter((variant) => selected.includes(variant.id));
  }, [data, selected]);

  const runAction = useCallback(
    async (action: InventoryBulkAction) => {
      if (Number.isNaN(value) || value < 1) {
        toast.error("Enter a valid value");
        return;
      }

      const previousState = selectedVariants.map((variant) => ({
        id: variant.id,
        stock: variant.stock,
      }));

      try {
        setLoading(true);

        toast.loading("Updating inventory...", {
          id: "inventory-bulk",
        });

        const response = await fetch("/api/inventory/bulk", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variantIds: selected,
            action,
            value,
          }),
        });

        if (!response.ok) {
          throw new Error();
        }

        await refresh();

        toast.success(`${selected.length} inventory items updated`, {
          id: "inventory-bulk",
        });
        router.refresh();

        const undoExpiresAt = Date.now() + 60000;

        toast.custom(
          (t: Toast) => (
            <UndoToast
              message={`Inventory ${action.toLowerCase()} applied successfully`}
              expiresAt={undoExpiresAt}
              onExpire={() => {
                toast.remove(t.id);
                router.refresh();
              }}
              onUndo={async () => {
                toast.remove(t.id);

                try {
                  toast.loading("Reverting inventory...", {
                    id: "undo-inventory",
                  });

                  const undoRes = await fetch("/api/inventory/bulk/undo", {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      previous: previousState,
                    }),
                  });

                  if (!undoRes.ok) {
                    throw new Error();
                  }

                  await refresh();

                  toast.success("Inventory restored", {
                    id: "undo-inventory",
                  });
                  router.refresh();
                } catch {
                  toast.error("Undo failed", {
                    id: "undo-inventory",
                  });
                }
              }}
            />
          ),
          {
            duration: 60000,
          }
        );
      } catch {
        toast.error("Failed to update inventory", {
          id: "inventory-bulk",
        });
      } finally {
        setLoading(false);
      }
    },
    [value, selected, selectedVariants, refresh, router]
  );

  const exportInventory = useCallback(() => {
    const rows = selectedVariants.map((variant) => ({
      Product: variant.product?.name ?? "",
      Variant: `${variant.value} ${variant.unit}`,
      Stock: variant.stock,
      MRP: variant.mrp ?? 0,
      SellingPrice: variant.sellingPrice ?? 0,
    }));

    exportCSV(rows, "inventory.csv");

    toast.success("Inventory exported");
  }, [selectedVariants]);

  if (!selected.length) {
    return null;
  }

  return (
    <>
      <BulkActionBar
        icon="📦"
        title="Items Selected"
        subtitle="Apply bulk actions on selected items"
        count={selected.length}
        onClear={clearSelection}
      >
        <input
          type="number"
          min={1}
          value={value}
          disabled={loading}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Stock value"
          className="
            w-24
            rounded-xl
            border
            px-3
            py-2
            text-center
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

        <BulkActionButton
          icon="➕"
          label="Add"
          color="green"
          loading={loading}
          onClick={() => runAction(InventoryBulkAction.ADD)}
        />

        <BulkActionButton
          icon="➖"
          label="Reduce"
          color="red"
          loading={loading}
          onClick={() => {
            setPendingAction(InventoryBulkAction.REDUCE);
            setConfirmOpen(true);
          }}
        />

        <BulkActionButton
          icon="🎯"
          label="Set"
          color="blue"
          loading={loading}
          onClick={() => {
            setPendingAction(InventoryBulkAction.SET);
            setConfirmOpen(true);
          }}
        />

        <BulkActionButton
          icon="📄"
          label="Export CSV"
          color="gray"
          loading={loading}
          onClick={exportInventory}
        />
      </BulkActionBar>

      <ConfirmModal
        open={confirmOpen}
        title="Confirm Stock Update"
        description={`Apply ${pendingAction} stock action to ${selected.length} selected variants?`}
        confirmText="Continue"
        loading={loading}
        onClose={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={async () => {
          setConfirmOpen(false);

          if (pendingAction) {
            await runAction(pendingAction);
          }

          setPendingAction(null);
        }}
      />
    </>
  );
}

export default memo(BulkActions);
