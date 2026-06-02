"use client";

import { memo, useCallback, useMemo, useState } from "react";
import toast, { Toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import BulkActionBar from "../../../components/shared/BulkActionBar";
import BulkActionButton from "../../../components/shared/BulkActionButton";
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
  clearSelection: () => void;
}

function BulkActions({
  selectedProducts,
  products,
  onAction,
  clearSelection,
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
      <BulkActionBar
        icon="📦"
        title="Products Selected"
        subtitle="Apply bulk actions on selected products"
        count={selectedProducts.length}
        onClear={clearSelection}
      >
        <BulkActionButton
          icon="✅"
          label="Activate"
          color="green"
          loading={loading}
          onClick={() => handleAction(ProductBulkAction.ACTIVATE)}
        />

        <BulkActionButton
          icon="⏸️"
          label="Deactivate"
          color="yellow"
          loading={loading}
          onClick={() => handleAction(ProductBulkAction.DEACTIVATE)}
        />

        <BulkActionButton
          icon="🗑️"
          label="Delete"
          color="red"
          loading={loading}
          onClick={() => {
            setPendingAction(ProductBulkAction.DELETE);
            setConfirmOpen(true);
          }}
        />

        <BulkActionButton
          icon="📄"
          label="Export CSV"
          color="blue"
          loading={loading}
          onClick={exportProducts}
        />
      </BulkActionBar>

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
