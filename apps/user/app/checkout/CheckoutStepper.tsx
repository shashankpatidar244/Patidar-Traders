"use client";

import { Check } from "lucide-react";

type Props = {
  step: number;
};

export default function CheckoutStepper({ step }: Props) {
  const steps = [
    { id: 1, label: "Cart" },
    { id: 2, label: "Order Checkout" },
    { id: 3, label: "Order Success" },
  ];

  const progressWidth = step === 1 ? "0%" : step === 2 ? "50%" : "100%";

  return (
    <div className="w-full mb-10">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-6 left-0 w-full h-[2px] bg-zinc-200 rounded-full" />

        {/* Active Line */}
        <div
          className="absolute top-6 left-0 h-[2px] bg-zinc-900 rounded-full transition-all duration-700"
          style={{ width: progressWidth }}
        />

        <div className="relative flex justify-between">
          {steps.map((item) => {
            const completed = step > item.id;
            const active = step === item.id;

            return (
              <div key={item.id} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center
                    border-2 transition-all duration-300
                    ${
                      completed
                        ? "bg-zinc-900 border-zinc-900 text-white"
                        : active
                          ? "bg-white border-zinc-900 text-zinc-900 shadow-lg shadow-zinc-200"
                          : "bg-white border-zinc-300 text-zinc-400"
                    }
                  `}
                >
                  {completed ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <span className="font-semibold text-sm">{item.id}</span>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <p
                    className={`
                      text-sm font-semibold transition-colors
                      ${
                        active
                          ? "text-zinc-900"
                          : completed
                            ? "text-zinc-700"
                            : "text-zinc-400"
                      }
                    `}
                  >
                    {item.label}
                  </p>

                  <p
                    className={`
                      text-xs mt-1
                      ${active ? "text-zinc-500" : "text-zinc-400"}
                    `}
                  >
                    {completed
                      ? "Completed"
                      : active
                        ? "Current Step"
                        : "Pending"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
