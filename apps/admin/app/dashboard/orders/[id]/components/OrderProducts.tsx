import Image from "next/image"

export default function OrderProducts({ items }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">

      <h2 className="text-sm font-semibold text-gray-500 mb-4">
        ORDER ITEMS
      </h2>

      <div className="space-y-4">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex gap-4 items-center border-b last:border-0 pb-4"
          >
            {/* IMAGE */}
            <div className="w-16 h-16 relative">
              <Image
                src={item.product.images[0]?.url || "/placeholder.png"}
                alt=""
                fill
                className="rounded-lg object-cover"
              />
            </div>

            {/* DETAILS */}
            <div className="flex-1">
              <p className="font-medium text-gray-800">
                {item.product.name}
              </p>

              {item.variant && (
                <p className="text-xs text-gray-500 mt-1">
                  Variant: {item.variant.value}
                </p>
              )}

              <p className="text-xs text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>

            {/* PRICE */}
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ₹{item.price}
              </p>

              <p className="text-xs text-gray-500">
                ₹{item.price} × {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}