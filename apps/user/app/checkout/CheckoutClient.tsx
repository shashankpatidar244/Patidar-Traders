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

  const [processingPayment, setProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const [paymentState, setPaymentState] = useState<
    "READY" | "PROCESSING" | "VERIFYING" | "FAILED" | "SUCCESS"
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

      if (remaining <= 0) {
        clearInterval(interval);

        setPaymentState("FAILED");
        setPaymentStatus("Payment session expired.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

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

        handler: async function (response: any) {
          setPaymentModalOpen(true);

          setPaymentState("VERIFYING");
          setPaymentStatus("Payment received. Verifying...");

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
            setPaymentState("SUCCESS");

            setRetryOrder(null);
            setExpiresAt(null);
            setTimeLeft(0);

            setTimeout(() => {
              setLoading(false);
              setProcessingPayment(false);
              setPaymentModalOpen(false);

              router.push(`/checkout/order-success?orderId=${data.orderId}`);
            }, 1500);

            return;
          }

          setLoading(false);
          setProcessingPayment(false);

          setPaymentState("FAILED");
          setPaymentStatus(verifyData.error || "Payment verification failed.");

          setRetryOrder({
            orderId: data.orderId,
            razorpayOrderId: data.razorpayOrderId,
            amount: data.amount,
          });
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

        handler: async function (response: any) {
          try {
            setPaymentModalOpen(true);
            setPaymentState("VERIFYING");
            setPaymentStatus("Payment received. Verifying...");

            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              body: JSON.stringify({
                ...response,
                orderId: retryOrder.orderId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
              setLoading(false);
              setProcessingPayment(false);
              setPaymentModalOpen(true);
              setPaymentState("FAILED");
              setPaymentStatus(
                verifyData.error || "Payment verification failed."
              );

              setRetryOrder({
                orderId: data.orderId,
                razorpayOrderId: data.razorpayOrderId,
                amount: data.amount,
              });

              return;
            }

            setPaymentStatus("Payment successful. Redirecting...");
            setPaymentState("SUCCESS");

            setRetryOrder(null);
            setExpiresAt(null);
            setTimeLeft(0);

            setTimeout(() => {
              setLoading(false);
              setProcessingPayment(false);
              setPaymentModalOpen(false);

              router.push(
                `/checkout/order-success?orderId=${retryOrder.orderId}`
              );
            }, 1500);
          } catch (error) {
            console.error(error);

            setLoading(false);
            setProcessingPayment(false);
            setPaymentModalOpen(false);

            alert("Payment verification failed");
          }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>
  
          <p className="text-gray-500 mt-1">
            Complete your order securely
          </p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
  
            {/* Address */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
  
                <div>
                  <h2 className="font-semibold text-lg">
                    Delivery Address
                  </h2>
  
                  <p className="text-sm text-gray-500">
                    Choose where you want your order delivered
                  </p>
                </div>
              </div>
  
              <AddressSelector
                addresses={addresses}
                selected={selectedAddress}
                setSelected={setSelectedAddress}
              />
            </div>
  
            {/* Items */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
  
                <div>
                  <h2 className="font-semibold text-lg">
                    Review Items
                  </h2>
  
                  <p className="text-sm text-gray-500">
                    {cartItems.length} item(s) in your order
                  </p>
                </div>
              </div>
  
              <CheckoutItems items={cartItems} />
            </div>
          </div>
  
          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
  
                {/* Header */}
                <div className="px-6 py-5 border-b bg-gray-50">
                  <h2 className="font-semibold text-lg">
                    Order Summary
                  </h2>
  
                  <p className="text-sm text-gray-500">
                    Review and place your order
                  </p>
                </div>
  
                <div className="p-6">
                  <OrderSummary
                    cartItems={cartItems}
                    loading={loading}
                    onCheckout={handleCheckout}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                  />
                </div>
              </div>
  
              {loading && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Processing your order...
                </div>
              )}
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
