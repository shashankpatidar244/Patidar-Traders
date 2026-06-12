"use client";

import { useRouter } from "next/navigation";

export default function WishlistItem({ item }: any) {
  const router = useRouter();

  async function moveToCart() {
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

  return (
    <div
      onClick={() => router.push(`/products/${item.product.id}`)}
      className="
        flex gap-4
        border border-gray-200
        p-4
        rounded-2xl
        bg-white
        cursor-pointer

        shadow-sm
        hover:shadow-lg
        hover:border-orange-200

        transition-all
        duration-300
      "
    >
      <img
        src={item.product.images?.[0]?.url}
        alt={item.product.name}
        className="
          w-24
          h-24
          object-cover
          rounded-xl
          border
        "
      />

      <div className="flex-1">
        <p className="font-semibold text-lg text-slate-900">
          {item.product.name}
        </p>

        <p className="text-gray-500 mt-1">{item.variant.value}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            moveToCart();
          }}
          className="
            mt-4
            px-4
            py-2

            rounded-xl

            bg-orange-500
            text-white
            font-medium

            hover:bg-orange-600

            transition
          "
        >
          Move to Cart
        </button>
      </div>
    </div>
  );
}
