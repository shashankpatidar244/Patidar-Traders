type PaymentMethodType = "COD" | "ONLINE";

export default function OrderSummary({
  cartItems,
  loading,
  onCheckout,
  paymentMethod,
  setPaymentMethod,
}: {
  cartItems: any[];
  loading: boolean;
  onCheckout: () => void;
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (value: PaymentMethodType) => void;
}) {
  const total = cartItems.reduce(
    (sum: number, item: any) =>
      sum +
      (item.variant?.sellingPrice ??
        item.variant?.price ??
        item.variant?.mrp ??
        0) *
        item.quantity,
    0
  );

  const totalMrp = cartItems.reduce(
    (sum: number, item: any) => sum + (item.variant?.mrp ?? 0) * item.quantity,
    0
  );

  const totalItems = cartItems.length;

  const totalDiscount = totalMrp > total ? totalMrp - total : 0;

  return (
    <div className="sticky top-24">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* HEADER */}
        <div className="border-b p-5">
          <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
        </div>

        {/* CONTENT */}
        <div className="space-y-4 p-5">
          <div className="flex justify-between">
            <span className="text-gray-600">Items</span>
            <span className="font-medium">{totalItems}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">MRP Total</span>

            <span className="text-gray-400 line-through">
              ₹{totalMrp.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Selling Price</span>

            <span className="font-medium">₹{total.toLocaleString()}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between font-medium text-green-600">
              <span>Discount</span>

              <span>- ₹{totalDiscount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>

            <span className="font-medium text-green-600">FREE</span>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>

              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          {totalDiscount > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-700">
                🎉 You are saving ₹{totalDiscount.toLocaleString()} on this
                order
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Payment Method */}
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">
                Payment Method
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* ONLINE */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`relative rounded-xl border p-3 transition-all ${
                    paymentMethod === "ONLINE"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {paymentMethod === "ONLINE" && (
                    <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] text-white">
                      ✓
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <span className="text-xl">💳</span>

                    <p className="mt-1 text-xs font-semibold text-gray-900">
                      Pay Online
                    </p>

                    <p className="mt-0.5 text-[10px] leading-tight text-gray-500">
                      UPI, Cards, Net Banking
                    </p>
                  </div>
                </button>

                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`relative rounded-xl border p-3 transition-all ${
                    paymentMethod === "COD"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {paymentMethod === "COD" && (
                    <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] text-white">
                      ✓
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <span className="text-xl">💵</span>

                    <p className="mt-1 text-xs font-semibold text-gray-900">
                      COD
                    </p>

                    <p className="mt-0.5 text-[10px] leading-tight text-gray-500">
                      Pay on delivery
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              disabled={loading || cartItems.length === 0}
              className={`w-full rounded-xl py-3.5 font-semibold text-white transition-all ${
                cartItems.length === 0
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200"
              }`}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "COD"
                  ? "Place COD Order"
                  : "Proceed to Payment →"}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500">
            🔒 Secure checkout • Cash on Delivery Available
          </div>
        </div>
      </div>
    </div>
  );
}
