import Image from "next/image";
import { Package2, Boxes, IndianRupee } from "lucide-react";

export default function OrderProducts({ items }: any) {
  const safeItems = items || [];

  const totalItems = safeItems.reduce(
    (acc: number, item: any) => acc + Number(item.quantity || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-gray-500">
            ORDER ITEMS
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            {safeItems.length} Products • {totalItems} Qty
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <Boxes size={16} />
          Products
        </div>
      </div>

      {/* ITEMS */}
      <div className="divide-y divide-gray-100">
        {safeItems.map((item: any) => {
          const subtotal = Number(item.price) * item.quantity;

          return (
            <div key={item.id} className="p-5 hover:bg-gray-50 transition">
              <div className="flex gap-4">
                {/* IMAGE */}
                <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-2xl border bg-gray-100">
                  <Image
                    src={item.product?.images?.[0]?.url || "/placeholder.png"}
                    alt={item.product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  {/* NAME */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {item.product?.name || "Deleted Product"}
                      </h3>

                      {/* VARIANT */}
                      {item.variant && (
                        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                          <Package2 size={12} />
                          {item.variant.name}: {item.variant.value}
                        </div>
                      )}

                      {/* QTY */}
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <span>Quantity:</span>

                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                          {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="flex items-center sm:justify-end gap-1 font-bold text-lg text-gray-900">
                        <IndianRupee size={16} />
                        {subtotal.toFixed(2)}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        ₹{Number(item.price).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="px-5 py-4 border-t bg-gray-50 flex items-center justify-between">
        <p className="text-sm text-gray-500">Total Products</p>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
            {safeItems.length}
          </span>

          <span className="text-sm text-gray-500">/ {totalItems} Qty</span>
        </div>
      </div>
    </div>
  );
}
