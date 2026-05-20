export default function OrderSummary({ cartItems, loading, onCheckout }: any) {
  // ✅ Total using sellingPrice
  const total = cartItems.reduce(
    (sum: number, item: any) =>
      sum + (item.variant?.sellingPrice ?? 0) * item.quantity,
    0
  );

  // ✅ Total MRP (for discount display)
  const totalMrp = cartItems.reduce(
    (sum: number, item: any) => sum + (item.variant?.mrp ?? 0) * item.quantity,
    0
  );

  const totalDiscount = totalMrp > total ? totalMrp - total : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow h-fit">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      {cartItems.map((item: any) => {
        const mrp = item.variant?.mrp;
        const sellingPrice = item.variant?.sellingPrice;

        const discount =
          mrp && sellingPrice && mrp > sellingPrice
            ? Math.round(((mrp - sellingPrice) / mrp) * 100)
            : 0;

        const itemTotal = (sellingPrice ?? 0) * item.quantity;

        return (
          <div key={item.id} className="mb-4">
            {/* Name + Qty */}
            <div className="flex justify-between text-sm">
              <span>
                {item.product.name} × {item.quantity}
              </span>

              <span className="font-medium">₹{itemTotal}</span>
            </div>

            {/* Price breakdown */}
            <div className="flex items-center gap-2 text-xs mt-1">
              {sellingPrice && (
                <span className="text-gray-900 font-medium">
                  ₹{sellingPrice}
                </span>
              )}

              {mrp && sellingPrice && mrp > sellingPrice && (
                <span className="text-gray-400 line-through">₹{mrp}</span>
              )}

              {discount > 0 && (
                <span className="text-green-600">{discount}% OFF</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Totals */}
      <div className="border-t pt-4 space-y-2">
        {/* MRP */}
        <div className="flex justify-between text-sm text-gray-400 line-through">
          <span>MRP Total</span>
          <span>₹{totalMrp}</span>
        </div>

        {/* Discount */}
        {totalDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>- ₹{totalDiscount}</span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded mt-4"
      >
        {loading ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
}
