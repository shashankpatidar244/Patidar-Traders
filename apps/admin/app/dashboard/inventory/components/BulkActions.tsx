"use client";

import { memo, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import UndoToast from "../../../components/shared/UndoToast";
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
}

enum InventoryBulkAction {
  ADD = "ADD",
  REDUCE = "REDUCE",
  SET = "SET",
}

interface SelectedVariant extends Variant {
  productName: string;
}

function BulkActions({ selected, data, refresh }: BulkActionsProps) {
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
      <div
        className="
        sticky
        bottom-3
        lg:top-4
        z-40
        
        rounded-2xl
        border
        border-white/30
        
        bg-white/70
        backdrop-blur-xl
        
        shadow-[0_8px_30px_rgb(0,0,0,0.08)]
        
        px-5
        py-4
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-blue-100
              "
            >
              📦
            </div>

            <div>
              <div className="font-semibold text-gray-900">
                {selected.length} Items Selected
              </div>

              <div className="text-xs text-gray-500">Manage stock in bulk</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <button
              type="button"
              disabled={loading}
              onClick={() => runAction(InventoryBulkAction.ADD)}
              className="
                rounded-xl
                bg-green-50
                px-4
                py-2
                text-sm
                font-medium
                text-green-700
                hover:bg-green-100
                disabled:opacity-50
              "
            >
              {loading ? "Loading..." : "➕ Add"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setPendingAction(InventoryBulkAction.REDUCE);
                setConfirmOpen(true);
              }}
              className="
                rounded-xl
                bg-red-50
                px-4
                py-2
                text-sm
                font-medium
                text-red-700
                hover:bg-red-100
                disabled:opacity-50
              "
            >
              {loading ? "Loading..." : "➖ Reduce"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setPendingAction(InventoryBulkAction.SET);
                setConfirmOpen(true);
              }}
              className="
                rounded-xl
                bg-blue-50
                px-4
                py-2
                text-sm
                font-medium
                text-blue-700
                hover:bg-blue-100
                disabled:opacity-50
              "
            >
              {loading ? "Loading..." : "🎯 Set"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={exportInventory}
              className="
                rounded-xl
                bg-gray-900
                px-4
                py-2
                text-sm
                font-medium
                text-white
                hover:bg-black
                disabled:opacity-50
              "
            >
              📄 Export CSV
            </button>
          </div>
        </div>
      </div>

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
