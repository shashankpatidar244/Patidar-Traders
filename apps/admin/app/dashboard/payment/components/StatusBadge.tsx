"use client";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<
    string,
    {
      color: string;
      icon: string;
      label: string;
    }
  > = {
    // PAYMENT STATUS
    PAID: {
      color: "bg-green-100 text-green-700 border border-green-200",
      icon: "✔",
      label: "Paid",
    },

    PENDING: {
      color: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      icon: "⏳",
      label: "Pending",
    },

    FAILED: {
      color: "bg-red-100 text-red-700 border border-red-200",
      icon: "✖",
      label: "Failed",
    },

    REFUNDED: {
      color: "bg-purple-100 text-purple-700 border border-purple-200",
      icon: "↩",
      label: "Refunded",
    },

    // DELIVERY STATUS
    PACKED: {
      color: "bg-blue-100 text-blue-700 border border-blue-200",
      icon: "📦",
      label: "Packed",
    },

    SHIPPED: {
      color: "bg-indigo-100 text-indigo-700 border border-indigo-200",
      icon: "🚚",
      label: "Shipped",
    },

    OUT_FOR_DELIVERY: {
      color: "bg-orange-100 text-orange-700 border border-orange-200",
      icon: "🛵",
      label: "Out for Delivery",
    },

    DELIVERED: {
      color: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      icon: "✅",
      label: "Delivered",
    },

    // ORDER STATUS
    CONFIRMED: {
      color: "bg-cyan-100 text-cyan-700 border border-cyan-200",
      icon: "✔",
      label: "Confirmed",
    },

    COMPLETED: {
      color: "bg-green-100 text-green-700 border border-green-200",
      icon: "🎉",
      label: "Completed",
    },

    CANCELLED: {
      color: "bg-red-100 text-red-700 border border-red-200",
      icon: "⛔",
      label: "Cancelled",
    },
  };

  const current = config[status] || {
    color: "bg-gray-100 text-gray-600 border border-gray-200",
    icon: "•",
    label: status
      ?.replaceAll("_", " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (c) => c.toUpperCase()),
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1
        text-xs font-semibold
        rounded-full
        whitespace-nowrap
        ${current.color}
      `}
    >
      {/* ICON */}
      <span className="text-xs leading-none">{current.icon}</span>

      {/* LABEL */}
      <span className="tracking-wide">{current.label}</span>
    </span>
  );
}
