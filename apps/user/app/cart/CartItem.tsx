"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartItem({ item, selected, onSelect }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(type: "inc" | "dec") {
    try {
      setLoading(true);

      await fetch("/api/cart", {
        method: "PATCH",
        body: JSON.stringify({
          id: item.id,
          type,
        }),
      });

      location.reload();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    await fetch("/api/cart", {
      method: "DELETE",
      body: JSON.stringify({ id: item.id }),
    });

    location.reload();
  }

  async function saveForLater() {
    await fetch("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({
        productId: item.productId,
        variantId: item.variantId,
      }),
    });

    await remove();
  }

  // Pricing logic
  const mrp = item.variant?.mrp;
  const sellingPrice = item.variant?.sellingPrice;

  const discount =
    mrp && sellingPrice && mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const totalPrice = (sellingPrice || 0) * item.quantity;

  return (
    <>
      <div
        onClick={() => router.push(`/products/${item.product.id}`)}
        className={` group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl transition-all duration-500 relative overflow-hidden cursor-pointer 
  ${
    selected
      ? "bg-orange-50 border-orange-200 shadow-md"
      : "bg-white border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200"
  }
  `}
      >
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onSelect(item, e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>

        {/* Image */}
        <div
          className="
      w-24
      h-24
      md:w-28 
      md:h-28

      bg-gradient-to-br
      from-gray-50
      to-gray-100

      rounded-2xl

      overflow-hidden
      flex-shrink-0

      border
      border-gray-100

      shadow-sm
    "
        >
          <img
            src={item.product.images?.[0]?.url}
            alt={item.product.name}
            className="
        w-full
        h-full
        object-cover

        transition-all
        duration-700

        group-hover:scale-105
      "
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="
        font-semibold
        text-base
        md:text-lg
        text-gray-900

        line-clamp-2
      "
          >
            {item.product.name}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Variant: {item.variant?.value}
          </p>

          {/* Price */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{sellingPrice}
            </span>

            {mrp && mrp > sellingPrice && (
              <span className="text-sm text-gray-400 line-through">₹{mrp}</span>
            )}

            {discount > 0 && (
              <span
                className="
            bg-green-50
            text-green-700

            border
            border-green-200

            px-2
            py-0.5

            rounded-full

            text-[11px]
            font-semibold
          "
              >
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />

            <span className="text-xs font-medium text-green-600">In Stock</span>
          </div>
        </div>

        {/* Quantity */}
        {loading ? (
          <div
            className="
        flex
        items-center
        justify-center

        w-[110px]
        h-[42px]

        bg-gray-50
        border
        border-gray-200

        rounded-xl
      "
          >
            <div
              className="
          w-5
          h-5

          border-2
          border-orange-500
          border-t-transparent

          rounded-full
          animate-spin
        "
            />
          </div>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="
        flex
        items-center

        bg-white

        border
        border-gray-300

        rounded-xl

        overflow-hidden

        shadow-sm
      "
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                update("dec");
              }}
              disabled={loading}
              className="
          w-10
          h-10

          flex
          items-center
          justify-center

          hover:bg-gray-50

          transition-all
          duration-200

          font-semibold
          text-lg

          disabled:opacity-50
          disabled:cursor-not-allowed
        "
            >
              −
            </button>

            <span
              className="
          w-10

          text-center

          font-semibold
          text-gray-900
        "
            >
              {item.quantity}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                update("inc");
              }}
              disabled={loading}
              className="
          w-10
          h-10

          flex
          items-center
          justify-center

          hover:bg-gray-50

          transition-all
          duration-200

          font-semibold
          text-lg

          disabled:opacity-50
          disabled:cursor-not-allowed
        "
            >
              +
            </button>
          </div>
        )}

        {/* Total */}
        <div className="w-24 text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">
            Total
          </p>

          <p className="text-xl font-bold text-gray-900">₹{totalPrice}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              saveForLater();
            }}
            className="
        px-3
        py-1.5

        rounded-lg

        bg-blue-50
        text-blue-700

        hover:bg-blue-100

        transition

        text-xs
        font-medium
      "
          >
            Save Later
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              remove();
            }}
            className="
        px-3
        py-1.5

        rounded-lg

        bg-red-50
        text-red-600

        hover:bg-red-100

        transition

        text-xs
        font-medium
      "
          >
            Remove
          </button>
        </div>
      </div>
    </>
  );
}
