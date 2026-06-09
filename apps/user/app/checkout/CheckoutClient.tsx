"use client";

import { useEffect, useState } from "react";
import OrderSummary from "./OrderSummary";
import AddressSelector from "./AddressSelector";
import CheckoutItems from "./CheckoutItems";
import PaymentProcessingModal from "./PaymentProcessingModal";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [gateway, setGateway] = useState<"RAZORPAY" | "UPI" | "CARD">(
    "RAZORPAY"
  );

  const [processingPayment, setProcessingPayment] = useState(false);

  const [loading, setLoading] = useState(false);

  const [retryOrder, setRetryOrder] = useState<{
    orderId: number;
    razorpayOrderId: string;
    amount: number;
  } | null>(null);

  // NEW: expiry + timer
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // =========================
  // LOAD DATA
  // =========================
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

  // =========================
  // TIMER LOGIC
  // =========================
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setRetryOrder(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  function formatTime(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  async function startOnlineCheckout() {
    try {
      setProcessingPayment(true);
      setLoading(true);

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

      setPaymentStatus("Order created successfully...");

      await new Promise((resolve) => setTimeout(resolve, 700));

      setPaymentStatus("Creating Razorpay payment order...");

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

        handler: async function (response: any) {
          setPaymentModalOpen(true);

          setPaymentStatus("Verifying payment...");

          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            body: JSON.stringify({
              ...response,
              orderId: data.orderId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setPaymentStatus("Payment successful. Redirecting...");

            setTimeout(() => {
              setLoading(false);
              setProcessingPayment(false);
              setPaymentModalOpen(false);

              router.push(`/order-success?orderId=${data.orderId}`);
            }, 1500);
          } else {
            setLoading(false);
            setProcessingPayment(false);
            setPaymentModalOpen(false);

            setRetryOrder({
              orderId: data.orderId,
              razorpayOrderId: data.razorpayOrderId,
              amount: data.amount,
            });
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setProcessingPayment(false);
            setPaymentModalOpen(false);

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
          upi: gateway === "UPI",
          card: gateway === "CARD",
          netbanking: gateway === "RAZORPAY",
          wallet: gateway === "RAZORPAY",
        },
      };

      const rzp = new window.Razorpay(options);

      setPaymentStatus("Opening secure payment gateway...");

      setTimeout(() => {
        setPaymentModalOpen(false);
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

  // =========================
  // CHECKOUT
  // =========================
  async function handleCheckout() {
    if (!selectedAddress) {
      alert("Select address");
      return;
    }

    // ONLINE
    if (paymentMethod === "ONLINE") {
      setGateway("RAZORPAY");
      setProcessingPayment(false);
      setPaymentModalOpen(true);
      return;
    }

    // COD
    try {
      setLoading(true);

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
        alert(data.error || "Checkout failed");
        return;
      }

      router.push(`/order-success?orderId=${data.orderId}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // RETRY
  // =========================
  async function handleRetry() {
    if (!retryOrder) return;

    if (timeLeft <= 0) {
      alert("Order expired. Please place a new order.");
      return;
    }

    const res = await fetch("/api/payment/retry", {
      method: "POST",
      body: JSON.stringify({ orderId: retryOrder.orderId }),
    });

    const data = await res.json();

    setProcessingPayment(true);
    setPaymentModalOpen(true);
    setPaymentStatus("Opening Razorpay...");

    const rzp = new window.Razorpay({
      key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      order_id: data.razorpayOrderId,
      amount: data.amount,

      handler: async function (response: any) {
        setPaymentStatus("Verifying payment...");

        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          body: JSON.stringify({
            ...response,
            orderId: retryOrder.orderId,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          setPaymentStatus("Payment successful. Redirecting...");

          setTimeout(() => {
            router.push(`/order-success?orderId=${retryOrder.orderId}`);
          }, 1200);
        } else {
          setPaymentModalOpen(false);
        }
      },
    });

    rzp.open();
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* LEFT */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">📍 Delivery Address</h2>
          <AddressSelector
            addresses={addresses}
            selected={selectedAddress}
            setSelected={setSelectedAddress}
          />
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <CheckoutItems items={cartItems} />
        </div>

        {/* RETRY + TIMER */}
        {retryOrder && (
          <div className="border border-red-300 bg-red-50 rounded-2xl p-6">
            <h3 className="text-red-600 font-semibold text-lg mb-2">
              ❌ Payment Failed
            </h3>

            {timeLeft > 0 ? (
              <>
                <p className="text-sm mb-2">Retry before expiry</p>

                <p className="font-semibold mb-4">⏳ {formatTime(timeLeft)}</p>

                <button
                  onClick={handleRetry}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg"
                >
                  Retry Payment
                </button>
              </>
            ) : (
              <>
                <p className="mb-4">⛔ Order expired</p>

                <button
                  onClick={() => router.push("/cart")}
                  className="bg-black text-white px-5 py-2 rounded-lg"
                >
                  Go to Cart
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="space-y-4">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <OrderSummary
            cartItems={cartItems}
            loading={loading}
            onCheckout={handleCheckout}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-500">⏳ Processing...</p>
        )}
      </div>

      <PaymentProcessingModal
        open={paymentModalOpen}
        status={paymentStatus}
        paymentMethod={paymentMethod}
        gateway={gateway}
        setGateway={setGateway}
        processing={processingPayment}
        onContinue={startOnlineCheckout}
      />
    </div>
  );
}
