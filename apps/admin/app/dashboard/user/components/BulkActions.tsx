"use client";

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import ConfirmModal from "../../../components/shared/ConfirmModal";
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
}

enum UserBulkAction {
  BLOCK = "BLOCK",
  UNBLOCK = "UNBLOCK",
}

export default function BulkActions({ selected, users }: BulkActionsProps) {
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

        const UNDO_TIMEOUT = 60000;
        const undoExpiresAt = Date.now() + UNDO_TIMEOUT;

        if (!response.ok) {
          throw new Error();
        }

        toast.success(`${selected.length} users updated`, {
          id: "user-bulk",
        });

        toast.custom(
          (t: Toast) => (
            <UndoToast
              message="User status updated"
              expiresAt={undoExpiresAt}
              onExpire={() => {
                toast.dismiss(t.id);  
              }}
              onUndo={async () => {
                toast.dismiss(t.id);

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

                  window.location.reload();
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
    [selected, selectedUsers]
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
      <div
        className="
          sticky
          bottom-2
          lg:top-4
          z-40
          rounded-2xl
          border
          border-gray-200
          bg-white/95
          backdrop-blur
          shadow-lg
          px-4
          py-3
        "
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              👥
            </div>

            <div>
              <div className="font-semibold text-gray-900">
                {selected.length} Users Selected
              </div>

              <div className="text-xs text-gray-500">
                Perform bulk actions on selected users
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-wrap gap-2">
            <button
              disabled={loading}
              aria-label="Block Users"
              onClick={() => {
                setPendingAction(UserBulkAction.BLOCK);
                setConfirmOpen(true);
              }}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-red-50
                px-4
                py-2
                text-sm
                font-medium
                text-red-700
                transition
                hover:bg-red-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? "Loading..." : "🚫 Block"}
            </button>

            <button
              disabled={loading}
              aria-label="Unblock Users"
              onClick={() => runAction(UserBulkAction.UNBLOCK)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-green-50
                px-4
                py-2
                text-sm
                font-medium
                text-green-700
                transition
                hover:bg-green-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? "Loading..." : "✅ Unblock"}
            </button>

            <button
              disabled={loading}
              onClick={exportUsers}
              aria-label="Export CSV"
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-blue-50
                px-4
                py-2
                text-sm
                font-medium
                text-blue-700
                transition
                hover:bg-blue-100
                disabled:cursor-not-allowed
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
        title="Block Users"
        description={`Are you sure you want to block ${selected.length} selected users?`}
        loading={loading}
        confirmText="Block Users"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);

          if (pendingAction) {
            runAction(pendingAction);
          }
        }}
      />
    </>
  );
}
