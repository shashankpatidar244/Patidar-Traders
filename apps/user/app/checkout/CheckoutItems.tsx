"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
interface Props {
  items: any[];
}

export default function CheckoutItems({ items }: Props) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-gray-50 to-white px-6 py-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">🛍 Order Items</h2>

          <span className="rounded-full bg-black text-white text-xs font-medium px-3 py-1">
            {items.length} Items
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="p-3 sm:p-4 space-y-4">
        {items.map((item) => {
          const product = item.product;
          const variant = item.variant;

          const imageSrc =
            product?.images?.length > 0 ? product.images[0]?.url : null;

          const sellingPrice =
            variant?.price ?? variant?.sellingPrice ?? variant?.mrp ?? 0;

          const subtotal = sellingPrice * item.quantity;

          return (
            <div
              key={item.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-slate-300 hover:shadow-lg active:scale-[0.99]"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={product?.name || "Product"}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col sm:flex-row gap-3">
                  {/* LEFT SIDE */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-[15px] leading-5">
                      {item.quantity} × {product?.name}
                    </h3>

                    {variant && (
                      <div className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {variant.name}: {variant.value}
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        ₹{sellingPrice.toLocaleString()}
                      </span>

                      {variant?.mrp && variant.mrp > sellingPrice && (
                        <>
                          <span className="text-sm text-slate-400 line-through">
                            ₹{variant.mrp.toLocaleString()}
                          </span>

                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            Save ₹
                            {(variant.mrp - sellingPrice).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="text-right shrink-0 flex flex-col items-end justify-between">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Subtotal
                    </p>

                    <p className="text-xl font-bold text-slate-900">
                      ₹{subtotal.toLocaleString()}
                    </p>
                    <div className="mt-2 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      Qty {item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
