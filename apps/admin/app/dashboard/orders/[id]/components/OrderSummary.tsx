function Badge({ text, color }: any) {
  return (
    <span className={`px-2 py-1 text-xs rounded ${color}`}>
      {text}
    </span>
  )
}

export default function OrderSummary({ order }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">

      <h2 className="text-sm font-semibold text-gray-500 mb-4">
        ORDER SUMMARY
      </h2>

      <div className="space-y-3 text-sm">

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{order.total}</span>
        </div>

        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span>₹0</span>
        </div>

        <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>

        {/* PAYMENT */}
        <div className="pt-3 flex justify-between items-center">
          <span className="text-gray-500">Payment</span>
          <Badge
            text={order.paymentMethod}
            color="bg-gray-100 text-gray-700"
          />
        </div>

        {/* STATUS */}
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Status</span>
          <Badge
            text={order.status}
            color="bg-blue-100 text-blue-700"
          />
        </div>

      </div>
    </div>
  )
}