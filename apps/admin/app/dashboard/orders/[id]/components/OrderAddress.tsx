export default function OrderAddress({ order }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      
      <h2 className="text-sm font-semibold text-gray-500 mb-3">
        SHIPPING ADDRESS
      </h2>

      <div className="space-y-1">
        <p className="font-medium text-gray-800">
          {order.shippingFullName}
        </p>

        <p className="text-sm text-gray-600">
          {order.shippingPhone}
        </p>
      </div>

      <div className="mt-3 text-sm text-gray-600 leading-relaxed">
        <p>{order.shippingLine1}</p>
        {order.shippingLine2 && <p>{order.shippingLine2}</p>}
        <p>
          {order.shippingCity}, {order.shippingState}
        </p>
        <p>{order.shippingPincode}</p>
      </div>

    </div>
  )
}