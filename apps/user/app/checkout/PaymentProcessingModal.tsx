"use client";

interface Props {
  open: boolean;
  status: string;
  paymentMethod: "COD" | "ONLINE";
  processing: boolean;
  onContinue: () => void;
  paymentState:
  | "READY"
  | "PROCESSING"
  | "VERIFYING"
  | "FAILED"
  | "SUCCESS";

timeLeft: number;

onRetry: () => void;
}

export default function PaymentProcessingModal({
  open,
  status,
  paymentMethod,
  processing,
  onContinue,
  paymentState,
  timeLeft,
  onRetry,
}: Props) {
  if (!open) return null;

  function formatTime(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
  
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  // COD MODAL
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

  if (paymentState === "FAILED") {
    return (
      <div className="p-6">
        <div className="text-center">
  
          <div className="text-5xl mb-4">
            ❌
          </div>
  
          <h3 className="font-bold text-xl">
            Payment Failed
          </h3>
  
          <p className="mt-2 text-gray-500">
            Payment could not be completed.
          </p>
  
          <p className="mt-4 font-semibold">
            Retry available for:
            {formatTime(timeLeft)}
          </p>
  
          <button
            onClick={onRetry}
            className="mt-6 w-full rounded-xl bg-orange-500 py-3 text-white"
          >
            Retry Payment
          </button>
  
        </div>
      </div>
    );
  }

  // ONLINE MODAL
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      {" "}
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Secure Checkout</h2>

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
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                    ⚡
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Razorpay Secure Checkout
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      UPI, Cards, Net Banking & Wallets
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-900">
                  Available Payment Options
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div>✓ UPI (PhonePe, Google Pay, Paytm)</div>
                  <div>✓ Credit & Debit Cards</div>
                  <div>✓ Net Banking</div>
                  <div>✓ Wallets</div>
                </div>
              </div>
            </div>

            <div className="border-t p-5">
              <button
                onClick={onContinue}
                className="w-full rounded-2xl bg-orange-500 py-4 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Continue to Razorpay →
              </button>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="flex flex-col items-center">
              <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

              <h3 className="text-lg font-bold text-gray-900">
                Processing Payment
              </h3>

              <p className="mt-2 text-center text-sm text-gray-500">{status}</p>

              <div className="mt-6 w-full rounded-2xl bg-gray-50 p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span>Order Created</span>
                  </div>

                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span>Razorpay Order Created</span>
                  </div>

                  <div className="flex items-center gap-2 text-orange-500">
                    <span>⏳</span>
                    <span>Opening Payment Gateway</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <span>💳</span>
                    <span>Waiting For Payment</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <span>🔒</span>
                    <span>Verifying Payment</span>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-gray-400">
                Please do not close or refresh this page
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
