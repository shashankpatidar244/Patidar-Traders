"use client";

import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";

interface Props {
  orderStatus?: string;
  deliveryStatus?: string;
}

export default function OrderTimeline({
  orderStatus,
  deliveryStatus,
}: Props) {
  // ================= ORDER FLOW =================
  const orderSteps = [
    {
      key: "PENDING",
      label: "Pending",
      icon: Clock3,
    },

    {
      key: "CONFIRMED",
      label: "Confirmed",
      icon: CheckCircle2,
    },

    {
      key: "PACKED",
      label: "Packed",
      icon: PackageCheck,
    },

    {
      key: "COMPLETED",
      label: "Completed",
      icon: Truck,
    },
  ];

  // ================= DELIVERY FLOW =================
  const deliverySteps = [
    {
      key: "PENDING",
      label: "Pending",
      icon: Clock3,
    },

    {
      key: "PACKED",
      label: "Packed",
      icon: PackageCheck,
    },

    {
      key: "SHIPPED",
      label: "Shipped",
      icon: Truck,
    },

    {
      key: "OUT_FOR_DELIVERY",
      label: "Out for Delivery",
      icon: Truck,
    },

    {
      key: "DELIVERED",
      label: "Delivered",
      icon: CheckCircle2,
    },
  ];

  // ================= INDEX =================
  const orderIndex = Math.max(
    0,
    orderSteps.findIndex((s) => s.key === orderStatus)
  );

  const deliveryIndex = Math.max(
    0,
    deliverySteps.findIndex(
      (s) => s.key === deliveryStatus
    )
  );

  const cancelled = orderStatus === "CANCELLED";

  // ================= REUSABLE TIMELINE =================
  function TimelineUI({
    title,
    subtitle,
    steps,
    currentIndex,
  }: any) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
              {title}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {subtitle}
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
            In Progress
          </div>
        </div>

        {/* TIMELINE */}
        <div className="p-6">
          <div className="hidden lg:flex items-center justify-between relative">
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full" />

            <div
              className="absolute top-5 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${
                  currentIndex <= 0
                    ? 0
                    : (currentIndex /
                        (steps.length - 1)) *
                      100
                }%`,
              }}
            />

            {steps.map(
              (step: any, index: number) => {
                const active =
                  index <= currentIndex;

                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className="relative z-10 flex flex-col items-center flex-1"
                  >
                    {/* ICON */}
                    <div
                      className={`
                        w-11 h-11 rounded-2xl
                        flex items-center justify-center
                        border-4 border-white shadow-md
                        transition-all duration-300
                        ${
                          active
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-400"
                        }
                      `}
                    >
                      <Icon size={18} />
                    </div>

                    {/* LABEL */}
                    <div className="mt-3 text-center">
                      <p
                        className={`
                          text-sm font-semibold
                          ${
                            active
                              ? "text-green-700"
                              : "text-gray-400"
                          }
                        `}
                      >
                        {step.label}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Step {index + 1}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* MOBILE */}
          <div className="lg:hidden space-y-5">
            {steps.map(
              (step: any, index: number) => {
                const active =
                  index <= currentIndex;

                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className="flex gap-4"
                  >
                    {/* LEFT */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-xl
                          flex items-center justify-center
                          ${
                            active
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          }
                        `}
                      >
                        <Icon size={18} />
                      </div>

                      {index !==
                        steps.length - 1 && (
                        <div
                          className={`
                            w-1 flex-1 mt-2 rounded-full
                            ${
                              index <
                              currentIndex
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }
                          `}
                        />
                      )}
                    </div>

                    {/* RIGHT */}
                    <div className="pt-1">
                      <p
                        className={`
                          font-semibold
                          ${
                            active
                              ? "text-green-700"
                              : "text-gray-400"
                          }
                        `}
                      >
                        {step.label}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Step {index + 1}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= CANCELLED =================
  if (cancelled) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <XCircle size={30} />
          </div>

          <h3 className="text-lg font-bold text-red-600">
            Order Cancelled
          </h3>

          <p className="text-sm text-gray-500 mt-2 max-w-md">
            This order has been cancelled and
            will not continue through the
            delivery process.
          </p>
        </div>
      </div>
    );
  }

  // ================= MAIN =================
  return (
    <div className="space-y-6">
      <TimelineUI
        title="Order Status"
        subtitle="Order workflow progress"
        steps={orderSteps}
        currentIndex={orderIndex}
      />

      <TimelineUI
        title="Delivery Status"
        subtitle="Shipment tracking progress"
        steps={deliverySteps}
        currentIndex={deliveryIndex}
      />
    </div>
  );
}