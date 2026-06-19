"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export default function WishlistItem({ item }: any) {
  const router = useRouter();

  const mrp = item.variant?.mrp;
  const sellingPrice = item.variant?.sellingPrice;

  const discount =
    mrp && sellingPrice && mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  async function moveToCart(e: any) {
    e.stopPropagation();

    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({
        productId: item.productId,
        variantId: item.variantId,
      }),
    });

    await fetch("/api/wishlist", {
      method: "DELETE",
      body: JSON.stringify({ id: item.id }),
    });

    location.reload();
  }

  async function removeItem(e: any) {
    e.stopPropagation();

    await fetch("/api/wishlist", {
      method: "DELETE",
      body: JSON.stringify({ id: item.id }),
    });

    location.reload();
  }

  return (
    <div
      onClick={() => router.push(`/products/${item.product.id}`)}
      className="
        w-full bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 ease-out group relative
      "
    >
      {/* IMAGE */}
      <div className="w-full h-40 sm:w-30 sm:h-30 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
        <img
          src={item.product.images?.[0]?.url}
          alt={item.product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        <span className="absolute top-1.5 left-1.5 bg-emerald-600/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
          In Stock
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full py-0.5">
        {/* TITLE */}
        <div className="space-y-0.5">
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer">
            {item.product.name}
          </h3>

          <p className="text-xs text-slate-500 font-medium">
            {item.variant?.value}
          </p>
        </div>

        {/* PRICE + ACTIONS */}
        <div className="flex items-end justify-between mt-3 sm:mt-4">
          {/* PRICE */}
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                ₹{sellingPrice}
              </span>

              {discount > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                  {discount}% OFF
                </span>
              )}
            </div>

            {mrp && (
              <span className="text-xs font-medium text-slate-400 line-through mt-0.5">
                ₹{mrp}
              </span>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-2">
            <button
              onClick={moveToCart}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingCart size={18} className="shrink-0" />

              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add to Cart</span>
            </button>

            <button
              onClick={removeItem}
              className="ml-3 p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-[0.95] transition-all cursor-pointer"
              aria-label="Remove item"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
