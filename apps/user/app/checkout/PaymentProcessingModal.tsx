"use client";

interface Props {
  open: boolean;
  status: string;
  paymentMethod: "COD" | "ONLINE";
  processing: boolean;

  paymentState:
    | "READY"
    | "PROCESSING"
    | "VERIFYING"
    | "WAITING_WEBHOOK"
    | "FAILED"
    | "SUCCESS";

  timeLeft: number;

  onContinue: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export default function PaymentProcessingModal({
  open,
  status,
  paymentMethod,
  processing,
  paymentState,
  timeLeft,
  onContinue,
  onRetry,
  onClose,
}: Props) {
  if (!open) return null;

  function formatTime(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  // COD
  if (paymentMethod === "COD") {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        {" "}
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
          {" "}
          <div className="flex flex-col items-center text-center">
            {" "}
            <div className="mb-5 h-14 w-14 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <h3 className="text-xl font-bold text-gray-900">Placing Order</h3>
            <p className="mt-3 text-sm text-gray-600">{status}</p>
            <p className="mt-5 text-xs text-gray-400">
              Please do not close this page
            </p>
          </div>
        </div>
      </div>
    );
  }

  // WAITING FOR WEBHOOK
  if (paymentState === "WAITING_WEBHOOK") {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        {" "}
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          {" "}
          <div className="flex flex-col items-center text-center">
            {" "}
            <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Confirming Payment
            </h3>
            <p className="mt-3 text-gray-600">{status}</p>
            {timeLeft > 0 && (
              <div className="mt-5 rounded-xl bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-700">
                  Session expires in {formatTime(timeLeft)}
                </p>
              </div>
            )}
            <p className="mt-5 text-xs text-gray-400">
              Bank confirmation can take a few seconds. Please do not close this
              page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // FAILED
  if (paymentState === "FAILED") {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        {" "}
        <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          {" "}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            ✕{" "}
          </button>
          <div className="text-center">
            <div className="mb-4 text-6xl">❌</div>

            <h3 className="text-2xl font-bold text-gray-900">Payment Failed</h3>

            <p className="mt-3 text-gray-500">{status}</p>

            {timeLeft > 0 ? (
              <>
                <div className="mt-5 rounded-xl bg-orange-50 p-3">
                  <p className="text-sm font-medium text-orange-600">
                    Retry available for {formatTime(timeLeft)}
                  </p>
                </div>

                <button
                  onClick={onRetry}
                  className="mt-6 w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600"
                >
                  Retry Payment
                </button>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-red-500">
                  Payment session expired. Please create a new order.
                </p>

                <button
                  onClick={onClose}
                  className="mt-6 w-full rounded-2xl border py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back To Checkout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS
  if (paymentState === "SUCCESS") {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        {" "}
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          {" "}
          <div className="text-center">
            {" "}
            <div className="mb-4 text-6xl">✅ </div>
            <h3 className="text-2xl font-bold text-green-600">
              Payment Successful
            </h3>
            <p className="mt-3 text-gray-500">{status}</p>
          </div>
        </div>
      </div>
    );
  }

  // VERIFYING
  if (paymentState === "VERIFYING") {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        {" "}
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          {" "}
          <div className="flex flex-col items-center text-center">
            {" "}
            <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <h3 className="text-xl font-bold">Verifying Payment</h3>
            <p className="mt-3 text-gray-500">{status}</p>
          </div>
        </div>
      </div>
    );
  }

  // READY / PROCESSING
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      {" "}
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {" "}
        <div className="border-b bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div>
              {" "}
              <h2 className="text-xl font-bold">Secure Checkout </h2>
              <p className="mt-1 text-xs text-orange-100">
                256-bit SSL Encrypted Payment
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              🔒
            </div>
          </div>
        </div>
        {!processing ? (
          <>
            <div className="p-6">
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <h3 className="font-semibold">Razorpay Secure Checkout</h3>

                <p className="mt-2 text-sm text-gray-600">
                  UPI, Cards, Net Banking & Wallets
                </p>
              </div>
            </div>

            <div className="border-t p-5">
              <button
                onClick={onContinue}
                className="w-full rounded-2xl bg-orange-500 py-4 font-semibold text-white hover:bg-orange-600"
              >
                Continue to Razorpay →
              </button>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

              <h3 className="text-lg font-bold">Processing Payment</h3>

              <p className="mt-2 text-sm text-gray-500">{status}</p>

              <p className="mt-5 text-xs text-gray-400">
                Please do not close or refresh this page
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
