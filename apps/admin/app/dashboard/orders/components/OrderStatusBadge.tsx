"use client";

import {
  Clock3,
  CheckCircle2,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";

interface Props {
  status: string;
}

export default function OrderStatusBadge({ status }: Props) {
  const styles: Record<
    string,
    {
      label: string;
      icon: any;
      className: string;
    }
  > = {
    PENDING: {
      label: "Pending",
      icon: Clock3,
      className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    },

    CONFIRMED: {
      label: "Confirmed",
      icon: CheckCircle2,
      className: "bg-blue-50 text-blue-700 border border-blue-200",
    },

    PACKED: {
      label: "Packed",
      icon: PackageCheck,
      className: "bg-purple-50 text-purple-700 border border-purple-200",
    },

    COMPLETED: {
      label: "Completed",
      icon: Truck,
      className: "bg-green-50 text-green-700 border border-green-200",
    },

    CANCELLED: {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border border-red-200",
    },
  };

  const item =
    styles[status] ||
    ({
      label: status,
      icon: Clock3,
      className: "bg-gray-100 text-gray-700 border border-gray-200",
    } as const);

  const Icon = item.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5
        rounded-full
        text-xs font-semibold
        whitespace-nowrap
        ${item.className}
      `}
    >
      <Icon size={14} />
      {item.label}
    </span>
  );
}
