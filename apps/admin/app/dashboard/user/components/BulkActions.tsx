"use client";

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import ConfirmModal from "../../../components/shared/ConfirmModal";
import BulkActionBar from "../../../components/shared/BulkActionBar";
import BulkActionButton from "../../../components/shared/BulkActionButton";
import UndoToast from "../../../components/shared/UndoToast";

import { exportCSV } from "../../../lib/exportCsv";

interface UserRow {
  id: number;
  username: string | null;
  phone: string;
  role: string;
  totalOrders: number;
  totalSpend: number;
  isBlocked: boolean;
}

interface BulkActionsProps {
  selected: number[];
  users: UserRow[];
  clearSelection: () => void;
}

enum UserBulkAction {
  BLOCK = "BLOCK",
  UNBLOCK = "UNBLOCK",
}

export default function BulkActions({
  selected,
  users,
  clearSelection,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  const [pendingAction, setPendingAction] = useState<UserBulkAction | null>(
    null
  );

  const selectedUsers = useMemo(
    () => users.filter((user) => selected.includes(user.id)),
    [users, selected]
  );

  const runAction = useCallback(
    async (action: UserBulkAction) => {
      try {
        setLoading(true);

        const previousState = selectedUsers.map((user) => ({
          id: user.id,
          isBlocked: user.isBlocked,
        }));

        toast.loading("Updating users...", {
          id: "user-bulk",
        });

        const response = await fetch("/api/user/bulk", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userIds: selected,
            action,
          }),
        });

        const undoExpiresAt = Date.now() + 60000;

        if (!response.ok) {
          throw new Error();
        }

        toast.success(`${selected.length} users updated`, {
          id: "user-bulk",
        });
        router.refresh();

        toast.custom(
          (t: Toast) => (
            <UndoToast
              message={`Bulk users ${action.toLowerCase()}ed updated successfully`}
              expiresAt={undoExpiresAt}
              onExpire={() => {
                toast.remove(t.id);
                router.refresh();
              }}
              onUndo={async () => {
                toast.remove(t.id);

                try {
                  toast.loading("Reverting changes...", {
                    id: "undo-user",
                  });

                  const res = await fetch("/api/user/bulk", {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      undo: true,
                      users: previousState,
                    }),
                  });

                  if (!res.ok) {
                    throw new Error("Undo failed");
                  }

                  toast.success("Changes reverted", {
                    id: "undo-user",
                  });

                  router.refresh();
                } catch {
                  toast.error("Undo failed", {
                    id: "undo-user",
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
        toast.error("Failed to update users");
      } finally {
        setLoading(false);
      }
    },
    [selected, selectedUsers, router]
  );

  const exportUsers = useCallback(() => {
    exportCSV(
      selectedUsers.map((user) => ({
        ID: user.id,
        Name: user.username,
        Phone: user.phone,
        Role: user.role,
        Orders: user.totalOrders,
        Spend: user.totalSpend,
      })),
      "users.csv"
    );

    toast.success("CSV exported");
  }, [selectedUsers]);

  if (!selected.length) return null;

  return (
    <>
      <BulkActionBar
        icon="👥"
        title="Users Selected"
        subtitle="Apply bulk actions on selected users"
        count={selected.length}
        onClear={clearSelection}
      >
        <button
          disabled={loading}
          aria-label="Block Users"
          onClick={() => {
            setPendingAction(UserBulkAction.BLOCK);
            setConfirmOpen(true);
          }}
          className="
            inline-flex items-center gap-2
            rounded-xl bg-red-50 px-4 py-2
            text-sm font-medium text-red-700
            hover:bg-red-100
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {loading ? "Loading..." : "🚫 Block"}
        </button>

        <button
          disabled={loading}
          aria-label="Unblock Users"
          onClick={() => runAction(UserBulkAction.UNBLOCK)}
          className="
            inline-flex items-center gap-2
            rounded-xl bg-green-50 px-4 py-2
            text-sm font-medium text-green-700
            hover:bg-green-100
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {loading ? "Loading..." : "✅ Unblock"}
        </button>

        <button
          disabled={loading}
          onClick={exportUsers}
          aria-label="Export CSV"
          className="
            inline-flex items-center gap-2
            rounded-xl bg-blue-50 px-4 py-2
            text-sm font-medium text-blue-700
            hover:bg-blue-100
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          📄 Export CSV
        </button>
      </BulkActionBar>

      <ConfirmModal
        open={confirmOpen}
        title={
          pendingAction === UserBulkAction.BLOCK
            ? "Block Users"
            : "Confirm Action"
        }
        description={`Are you sure you want to ${
          pendingAction === UserBulkAction.BLOCK ? "block" : "modify"
        } ${selected.length} selected users?`}
        loading={loading}
        confirmText="Confirm"
        onClose={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={() => {
          setConfirmOpen(false);

          if (pendingAction) {
            runAction(pendingAction);
          }

          setPendingAction(null);
        }}
      />
    </>
  );
}
