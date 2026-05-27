"use client";

import {
  Clock3,
  CheckCircle2,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";

interface Props {
  orderStatus?: string;
  deliveryStatus?: string;
}

export default function OrderStatusBadge({
  orderStatus,
  deliveryStatus,
}: Props) {
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
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },

    CONFIRMED: {
      label: "Confirmed",
      icon: CheckCircle2,
      className: "bg-blue-50 text-blue-700 border border-blue-200",
    },

    PACKED: {
      label: "Packed",
      icon: PackageCheck,
      className: "bg-violet-50 text-violet-700 border border-violet-200",
    },

    COMPLETED: {
      label: "Completed",
      icon: Truck,
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },

    CANCELLED: {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border border-red-200",
    },
  };

  const deliveryStyles: Record<
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
      className: "bg-gray-50 text-gray-700 border border-gray-200",
    },

    PACKED: {
      label: "Packed",
      icon: PackageCheck,
      className: "bg-purple-50 text-purple-700 border border-purple-200",
    },

    SHIPPED: {
      label: "Shipped",
      icon: Truck,
      className: "bg-sky-50 text-sky-700 border border-sky-200",
    },

    OUT_FOR_DELIVERY: {
      label: "Out for Delivery",
      icon: Truck,
      className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    },

    DELIVERED: {
      label: "Delivered",
      icon: CheckCircle2,
      className: "bg-green-50 text-green-700 border border-green-200",
    },

    FAILED: {
      label: "Failed",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border border-red-200",
    },
  };

  // ORDER STATUS
  const orderItem = orderStatus
    ? styles[orderStatus] || {
        label: orderStatus,
        icon: Clock3,
        className: "bg-gray-100 text-gray-700 border border-gray-200",
      }
    : null;

  // DELIVERY STATUS
  const deliveryItem = deliveryStatus
    ? deliveryStyles[deliveryStatus] || {
        label: deliveryStatus.replaceAll("_", " "),
        icon: Truck,
        className: "bg-gray-100 text-gray-700 border border-gray-200",
      }
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ORDER STATUS */}
      {orderItem && (
        <span
          title={`Order Status: ${orderItem.label}`}
          className={`
            inline-flex items-center gap-1.5
            px-3 py-1.5
            rounded-xl
            text-xs font-semibold
            whitespace-nowrap
            shadow-sm
            transition-all duration-200
            hover:scale-[1.02]
            ${orderItem.className}
          `}
        >
          <orderItem.icon size={14} />
          {orderItem.label}
        </span>
      )}

      {/* DELIVERY STATUS */}
      {deliveryItem && (
        <span
          title={`Delivery Status: ${deliveryItem.label}`}
          className={`
            inline-flex items-center gap-1.5
            px-3 py-1.5
            rounded-xl
            text-xs font-semibold
            whitespace-nowrap
            shadow-sm
            transition-all duration-200
            hover:scale-[1.02]
            ${deliveryItem.className}
          `}
        >
          <deliveryItem.icon size={14} />
          {deliveryItem.label}
        </span>
      )}
    </div>
  );
}