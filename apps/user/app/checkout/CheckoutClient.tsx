"use client";

import { useEffect, useState } from "react";
import OrderSummary from "./OrderSummary";
import AddressSelector from "./AddressSelector";
import CheckoutItems from "./CheckoutItems";
import PaymentProcessingModal from "./PaymentProcessingModal";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  const [processingPayment, setProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const [paymentState, setPaymentState] = useState<
    | "READY"
    | "PROCESSING"
    | "VERIFYING"
    | "WAITING_WEBHOOK"
    | "FAILED"
    | "SUCCESS"
  >("READY");

  const [retryOrder, setRetryOrder] = useState<{
    orderId: number;
    razorpayOrderId: string;
    amount: number;
  } | null>(null);

  // NEW: expiry + timer
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // LOAD DATA
  useEffect(() => {
    async function load() {
      const cartRes = await fetch("/api/cart");
      const cart = await cartRes.json();

      const itemsParam = searchParams.get("items");

      if (itemsParam) {
        const selectedIds = itemsParam.split(",").map(Number);

        const filteredCart = cart.filter((item: any) =>
          selectedIds.includes(item.id)
        );

        setCartItems(filteredCart);
      } else {
        setCartItems(cart);
      }

      const addrRes = await fetch("/api/address");
      const addr = await addrRes.json();

      const list = addr.addresses || [];
      setAddresses(list);

      const defaultAddr = list.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    }

    load();
  }, [searchParams]);

  // TIMER LOGIC
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt - Date.now());

      setTimeLeft(remaining);

      if (remaining <= 0 && paymentState !== "SUCCESS") {
        clearInterval(interval);

        setPaymentState("FAILED");

        setPaymentStatus("Payment session expired.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, paymentState]);

  async function startOrderStatusPolling(orderId: number) {
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`/api/payment/payment-status/${orderId}`);

        const data = await res.json();

        if (data.paymentStatus === "PAID") {
          clearInterval(interval);

          setPaymentState("SUCCESS");
          setPaymentStatus("Payment confirmed successfully.");

          setRetryOrder(null);
          setExpiresAt(null);
          setTimeLeft(0);

          setTimeout(() => {
            setLoading(false);
            setProcessingPayment(false);
            setPaymentModalOpen(false);

            router.push(`/checkout/order-success?orderId=${orderId}`);
          }, 1500);

          return;
        }

        if (data.paymentStatus === "FAILED" || data.status === "CANCELLED") {
          clearInterval(interval);

          setPaymentState("FAILED");

          setPaymentStatus("Payment failed or cancelled.");

          return;
        }

        if (attempts >= 60) {
          clearInterval(interval);

          setPaymentState("FAILED");

          setPaymentStatus(
            "Payment confirmation timeout. Please check your orders."
          );
        }
      } catch (error) {
        console.error(error);
      }
    }, 3000);
  }

  // Online Checkout
  async function startOnlineCheckout() {
    try {
      setProcessingPayment(true);
      setLoading(true);
      setPaymentState("PROCESSING");

      const itemsParam = searchParams.get("items");

      setPaymentStatus("Creating your order...");

      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod: "ONLINE",
          addressId: selectedAddress,
          selectedItems: itemsParam,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setProcessingPayment(false);
        setPaymentModalOpen(false);
        setLoading(false);

        alert(data.error || "Checkout failed");
        return;
      }

      setPaymentStatus("Order created. Preparing payment...");

      await new Promise((resolve) => setTimeout(resolve, 700));

      setPaymentStatus("Initializing secure payment...");

      await new Promise((resolve) => setTimeout(resolve, 700));

      if (!window.Razorpay) {
        setProcessingPayment(false);
        setPaymentModalOpen(false);
        setLoading(false);

        alert("Razorpay SDK not loaded");
        return;
      }

      if (data.expiresAt) {
        setExpiresAt(new Date(data.expiresAt).getTime());
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        order_id: data.razorpayOrderId,

        name: "Your Store",
        description: "Secure Payment",

        handler: async function () {
          setPaymentModalOpen(true);

          setPaymentState("WAITING_WEBHOOK");

          setPaymentStatus(
            "Payment received. Waiting for bank confirmation..."
          );

          startOrderStatusPolling(data.orderId);
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setProcessingPayment(false);
            setPaymentModalOpen(true);

            setPaymentState("FAILED");
            setPaymentStatus("Payment cancelled by user.");

            setRetryOrder({
              orderId: data.orderId,
              razorpayOrderId: data.razorpayOrderId,
              amount: data.amount,
            });
          },
        },

        theme: {
          color: "#111827",
        },

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
      };

      const rzp = new window.Razorpay(options);

      setPaymentStatus("Opening secure payment gateway...");

      setTimeout(() => {
        rzp.open();
      }, 1000);
    } catch (error) {
      console.error(error);

      setProcessingPayment(false);
      setPaymentModalOpen(false);
      setLoading(false);

      alert("Something went wrong");
    }
  }

  // CHECKOUT
  async function handleCheckout() {
    if (!selectedAddress) {
      alert("Select address");
      return;
    }

    // ONLINE FLOW
    if (paymentMethod === "ONLINE") {
      setProcessingPayment(false);
      setPaymentState("READY");
      setPaymentStatus("Ready to start secure payment.");
      setPaymentModalOpen(true);
      setRetryOrder(null);
      setExpiresAt(null);
      setTimeLeft(0);
      return;
    }

    // COD FLOW
    try {
      setLoading(true);

      setProcessingPayment(true);
      setPaymentModalOpen(true);

      setPaymentState("PROCESSING");
      setPaymentStatus("Creating your order...");

      const itemsParam = searchParams.get("items");

      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod: "COD",
          addressId: selectedAddress,
          selectedItems: itemsParam,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setProcessingPayment(false);
        setPaymentModalOpen(false);
        setLoading(false);

        alert(data.error || "Checkout failed");
        return;
      }

      setPaymentStatus("Order confirmed successfully. Redirecting...");

      setTimeout(() => {
        setLoading(false);
        setProcessingPayment(false);
        setPaymentModalOpen(false);

        router.push(`/checkout/order-success?orderId=${data.orderId}`);
      }, 1200);
    } catch (error) {
      console.error(error);

      setProcessingPayment(false);
      setPaymentModalOpen(false);
      setLoading(false);

      alert("Something went wrong");
    }
  }

  // RETRY
  async function handleRetry() {
    try {
      if (!retryOrder) return;

      if (timeLeft <= 0) {
        alert("Order expired. Please place a new order.");
        return;
      }

      setLoading(true);

      const res = await fetch("/api/payment/retry", {
        method: "POST",
        body: JSON.stringify({
          orderId: retryOrder.orderId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setLoading(false);
        alert(data.error || "Unable to retry payment");
        return;
      }

      if (!window.Razorpay) {
        setLoading(false);
        setProcessingPayment(false);
        setPaymentModalOpen(false);

        alert("Razorpay SDK not loaded");
        return;
      }

      setProcessingPayment(true);
      setPaymentModalOpen(true);
      setPaymentState("PROCESSING");
      setPaymentStatus("Preparing payment retry...");

      const rzp = new window.Razorpay({
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY,

        amount: data.amount,
        currency: "INR",
        order_id: data.razorpayOrderId,

        name: "Your Store",
        description: "Secure Payment",

        handler: async function () {
          setPaymentModalOpen(true);

          setPaymentState("WAITING_WEBHOOK");

          setPaymentStatus(
            "Payment received. Waiting for bank confirmation..."
          );

          startOrderStatusPolling(retryOrder.orderId);
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setProcessingPayment(false);
            setPaymentModalOpen(true);
            setPaymentState("FAILED");
            setPaymentStatus("Payment cancelled by user.");

            setRetryOrder({
              orderId: data.orderId,
              razorpayOrderId: data.razorpayOrderId,
              amount: data.amount,
            });
          },
        },

        theme: {
          color: "#111827",
        },

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
      });

      setPaymentStatus("Opening secure payment gateway...");

      setTimeout(() => {
        rzp.open();
      }, 800);
    } catch (error) {
      console.error(error);

      setLoading(false);
      setProcessingPayment(false);
      setPaymentModalOpen(false);

      alert("Retry failed");
    }
  }

  // Close
  function handleClosePaymentModal() {
    setPaymentModalOpen(false);

    setProcessingPayment(false);

    if (paymentState === "FAILED") {
      setPaymentState("READY");
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#fcfcfd] via-white to-zinc-50 text-zinc-900 ">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12 flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-zinc-200/80 pb-6 md:pb-8">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/cart");
                  }
                }}
                className="group flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft
                  size={18}
                  strokeWidth={2.5}
                  className="text-zinc-600 transition-transform duration-200 group-hover:-translate-x-0.5"
                />
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
                  Checkout
                </h1>

                <p className="text-zinc-400 text-xs sm:text-sm mt-1 font-medium max-w-xl">
                  Review your order and complete payment securely.
                </p>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT SIDE */}
            <div className="lg:col-span-8 space-y-8">
              {/* Address Card */}
              <div className="bg-white border border-zinc-200/70 rounded-2xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-md shrink-0">
                    1
                  </div>

                  <div>
                    <h2 className="font-bold text-lg text-zinc-900 tracking-tight">
                      Delivery Address
                    </h2>

                    <p className="text-xs md:text-sm text-zinc-400 font-medium mt-0.5">
                      Choose where you want your order delivered.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-50/50">
                  <AddressSelector
                    addresses={addresses}
                    selected={selectedAddress}
                    setSelected={setSelectedAddress}
                  />
                </div>
              </div>

              {/* Review Items */}
              <div className="bg-white border border-zinc-200/70 rounded-2xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-md shrink-0">
                    2
                  </div>

                  <div>
                    <h2 className="font-bold text-lg text-zinc-900 tracking-tight">
                      Review Items
                    </h2>

                    <p className="text-xs md:text-sm text-zinc-400 font-medium mt-0.5">
                      Review items carefully before confirming your order.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-50/50">
                  <CheckoutItems items={cartItems} />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="lg:col-span-4">
              <div className="sticky top-10 space-y-5">
                {/* Summary */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_24px_rgba(0,0,0,0.03)]">
                  <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                    <h2 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                      Order Summary
                    </h2>

                    <p className="text-xs text-zinc-400 font-medium mt-0.5">
                      Review and place your order.
                    </p>
                  </div>

                  <div className="p-5 bg-zinc-50/20">
                    <OrderSummary
                      cartItems={cartItems}
                      loading={loading}
                      onCheckout={handleCheckout}
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                    />
                  </div>
                </div>

                {/* Processing State */}
                {loading && (
                  <div className="text-center py-3 px-4 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs font-mono font-bold text-zinc-400 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-ping" />
                    Processing your order...
                  </div>
                )}

                {/* Payment Session Timer */}
                {paymentMethod === "ONLINE" && timeLeft > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-amber-900">
                        Payment Session
                      </span>

                      <span className="font-mono text-base font-bold text-amber-700">
                        {Math.floor(timeLeft / 60000)}:
                        {String(Math.floor((timeLeft % 60000) / 1000)).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{
                          width: `${Math.max(
                            0,
                            (timeLeft / (10 * 60 * 1000)) * 100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="text-[11px] text-amber-700 mt-2">
                      Complete payment before the session expires.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentProcessingModal
        open={paymentModalOpen}
        status={paymentStatus}
        paymentState={paymentState}
        paymentMethod={paymentMethod}
        processing={processingPayment}
        timeLeft={timeLeft}
        onContinue={startOnlineCheckout}
        onRetry={handleRetry}
        onClose={handleClosePaymentModal}
      />
    </>
  );
}
