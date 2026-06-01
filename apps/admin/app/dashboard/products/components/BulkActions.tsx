"use client";

import { memo, useCallback, useMemo, useState } from "react";
import toast, { Toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import UndoToast from "../../../components/shared/UndoToast";
import { exportCSV } from "../../../lib/exportCsv";

export enum ProductBulkAction {
  ACTIVATE = "activate",
  DEACTIVATE = "deactivate",
  DELETE = "delete",
}

interface ProductRow {
  id: number;
  isActive: boolean;
  name?: string;
  price?: number;
}

interface BulkActionsProps {
  selectedProducts: number[];
  products: ProductRow[];
  onAction: (action: ProductBulkAction) => Promise<void> | void;
}

function BulkActions({
  selectedProducts,
  products,
  onAction,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ProductBulkAction | null>(
    null
  );

  const router = useRouter();

    //  Selected product snapshot
  const selectedProductRows = useMemo(() => {
    return products.filter((p) => selectedProducts.includes(p.id));
  }, [products, selectedProducts]);

  const previousState = useMemo(() => {
    return selectedProductRows.map((p) => ({
      id: p.id,
      isActive: p.isActive,
    }));
  }, [selectedProductRows]);

    //  MAIN ACTION HANDLER
  const handleAction = useCallback(
    async (action: ProductBulkAction) => {
      try {
        setLoading(true);

        toast.loading("Processing products...", {
          id: "product-bulk",
        });

        await Promise.resolve(onAction(action));

        toast.success(`${selectedProducts.length} products updated`, {
          id: "product-bulk",
        });

        router.refresh();

        const undoExpiresAt = Date.now() + 60000;

        toast.custom(
          (t: Toast) => (
            <UndoToast
            message={`Bulk products ${action} updated successfully`}
              expiresAt={undoExpiresAt}
              onExpire={() => {
                toast.remove(t.id);
                router.refresh();
              }}
              onUndo={async () => {
                toast.remove(t.id);

                try {
                  toast.loading("Reverting changes...", {
                    id: "undo-products",
                  });

                  const res = await fetch("/api/products/bulk", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      undo: true,
                      products: previousState,
                    }),
                  });

                  if (!res.ok) throw new Error();

                  toast.success("Changes reverted", {
                    id: "undo-products",
                  });

                  router.refresh();
                } catch {
                  toast.error("Undo failed", {
                    id: "undo-products",
                  });
                }
              }}
            />
          ),
          { duration: 60000 }
        );
      } catch {
        toast.error("Action failed", {
          id: "product-bulk",
        });
      } finally {
        setLoading(false);
      }
    },
    [onAction, selectedProducts.length, previousState, router]
  );

    //  EXPORT CSV (PRODUCTS)
  const exportProducts = useCallback(() => {
    exportCSV(
      selectedProductRows.map((p) => ({
        ID: p.id,
        Active: p.isActive ? "Yes" : "No",
        Name: p.name ?? "",
        Price: p.price ?? 0,
      })),
      "products.csv"
    );

    toast.success("Products exported");
  }, [selectedProductRows]);

  if (selectedProducts.length === 0) return null;

  return (
    <>
      {/* ACTION BAR */}
      <div
        className="
          sticky bottom-2 lg:top-4 z-40
          rounded-2xl border border-gray-200
          bg-white/95 backdrop-blur shadow-lg
          px-4 py-3
        "
      >
        <div
          className="
            flex flex-col gap-4
            lg:flex-row lg:items-center lg:justify-between
          "
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              📦
            </div>

            <div>
              <div className="font-semibold text-gray-900">
                {selectedProducts.length} Products Selected
              </div>
              <div className="text-xs text-gray-500">
                Bulk manage selected products
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex flex-wrap gap-2">
            <button
              disabled={loading}
              onClick={() => handleAction(ProductBulkAction.ACTIVATE)}
              className="px-4 py-2 text-sm rounded-xl bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              {loading ? "Loading..." : "✅ Activate"}
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction(ProductBulkAction.DEACTIVATE)}
              className="px-4 py-2 text-sm rounded-xl bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
            >
              {loading ? "Loading..." : "⏸ Deactivate"}
            </button>

            <button
              disabled={loading}
              onClick={() => {
                setPendingAction(ProductBulkAction.DELETE);
                setConfirmOpen(true);
              }}
              className="px-4 py-2 text-sm rounded-xl bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {loading ? "Loading..." : "🗑 Delete"}
            </button>

            <button
              disabled={loading}
              onClick={exportProducts}
              className="px-4 py-2 text-sm rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              📄 Export
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Products"
        description={`Are you sure you want to delete ${selectedProducts.length} products?`}
        confirmText="Delete"
        loading={loading}
        onClose={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={async () => {
          setConfirmOpen(false);

          if (pendingAction) {
            await handleAction(pendingAction);
          }

          setPendingAction(null);
        }}
      />
    </>
  );
}

export default memo(BulkActions);
