"use client";

import CheckoutStepper from "../CheckoutStepper";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight, Clock3 } from "lucide-react";

export default function OrderSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard/orders");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] px-4 py-8 md:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Stepper */}
        <CheckoutStepper step={5} />

        {/* Success Card */}
        <div className="mt-10 bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_30px_rgba(0,0,0,0.04)]">
          {/* Header */}
          <div className="bg-gradient-to-b from-green-50 to-white px-8 py-12 text-center border-b border-zinc-100">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2
                size={56}
                className="text-green-600"
                strokeWidth={2}
              />
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900">
              Order Placed Successfully
            </h1>

            <p className="mt-3 text-zinc-500 max-w-xl mx-auto">
              Your order has been confirmed and is now being processed. We’ll
              notify you when it ships.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 pt-2 pb-8 md:px-10 md:pt-4 md:pb-10">
            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/dashboard/orders")}
                className="flex-1 h-12 rounded-xl bg-zinc-900 text-white font-medium hover:bg-black transition flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                View Orders
              </button>

              <button
                onClick={() => router.push("/")}
                className="flex-1 h-12 rounded-xl border border-zinc-300 bg-white font-medium hover:bg-zinc-50 transition flex items-center justify-center gap-2"
              >
                Continue Shopping
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
