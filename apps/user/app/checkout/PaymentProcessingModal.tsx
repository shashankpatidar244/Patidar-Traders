"use client";

type GatewayType = "RAZORPAY" | "UPI" | "CARD";

interface Props {
  open: boolean;
  status: string;
  paymentMethod: "COD" | "ONLINE";

  gateway: GatewayType;
  setGateway: (value: GatewayType) => void;

  processing: boolean;
  onContinue: () => void;
}

export default function PaymentProcessingModal({
  open,
  status,
  paymentMethod,
  gateway,
  setGateway,
  processing,
  onContinue,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
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

        {/* PAYMENT SELECTION */}
        {!processing && paymentMethod === "ONLINE" && (
          <>
            <div className="p-6">
              <p className="mb-4 text-sm font-medium text-gray-700">
                Select Payment Method
              </p>

              <div className="space-y-3">
                {/* Razorpay */}
                <button
                  onClick={() => setGateway("RAZORPAY")}
                  className={`w-full rounded-2xl border p-4 transition-all ${
                    gateway === "RAZORPAY"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        ⚡
                      </div>

                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Razorpay</p>

                        <p className="text-xs text-gray-500">
                          Recommended • All payment options
                        </p>
                      </div>
                    </div>

                    {gateway === "RAZORPAY" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                        ✓
                      </div>
                    )}
                  </div>
                </button>

                {/* UPI */}
                <button
                  onClick={() => setGateway("UPI")}
                  className={`w-full rounded-2xl border p-4 transition-all ${
                    gateway === "UPI"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
                        📱
                      </div>

                      <div className="text-left">
                        <p className="font-semibold text-gray-900">UPI</p>

                        <p className="text-xs text-gray-500">
                          Google Pay • PhonePe • Paytm
                        </p>
                      </div>
                    </div>

                    {gateway === "UPI" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                        ✓
                      </div>
                    )}
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => setGateway("CARD")}
                  className={`w-full rounded-2xl border p-4 transition-all ${
                    gateway === "CARD"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl">
                        💳
                      </div>

                      <div className="text-left">
                        <p className="font-semibold text-gray-900">
                          Credit / Debit Card
                        </p>

                        <p className="text-xs text-gray-500">
                          Visa • Mastercard • RuPay
                        </p>
                      </div>
                    </div>

                    {gateway === "CARD" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t p-5">
              <button
                onClick={onContinue}
                disabled={!gateway}
                className="w-full rounded-2xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600 shadow-lg shadow-orange-200"
              >
                Continue Secure Payment →
              </button>
            </div>
          </>
        )}

        {/* PROCESSING */}
        {processing && (
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
                    <span>Payment Order Created</span>
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
                Do not close or refresh this page
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
