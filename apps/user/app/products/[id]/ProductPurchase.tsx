"use client"

import { useState } from "react"
import AddToCartButton from "../../dashboard/components/AddToCartButton"

export default function ProductPurchase({ product }: any) {

  const [variantId, setVariantId] = useState(
    product.variants[0]?.id
  )

  const selectedVariant = product.variants.find(
    (v: any) => v.id === variantId
  )

  // New pricing logic
  const mrp = selectedVariant?.mrp
  const sellingPrice = selectedVariant?.sellingPrice

  const discount =
    mrp && sellingPrice && mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0

  return (
    <div>

      {/* Price */}
      <div className="flex items-center gap-2 mt-4">
        {sellingPrice && (
          <p className="text-2xl font-bold text-gray-900">
            ₹{sellingPrice}
          </p>
        )}

        {mrp && sellingPrice && mrp > sellingPrice && (
          <p className="text-sm text-gray-400 line-through">
            ₹{mrp}
          </p>
        )}

        {discount > 0 && (
          <span className="text-sm text-green-600 font-medium">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Variant Buttons */}
      <div className="mt-6">

        <p className="font-semibold mb-2">
          {selectedVariant?.name}
        </p>

        <div className="flex gap-3 flex-wrap">
          {product.variants.map((v: any) => (
            <button
              key={v.id}
              onClick={() => setVariantId(v.id)}
              className={`px-4 py-2 border rounded-lg transition
              ${
                variantId === v.id
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-300 hover:border-black"
              }`}
            >
              {v.value}
            </button>
          ))}
        </div>

      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">

        <AddToCartButton
          productId={product.id}
          variantId={variantId}
        />

        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
          Buy Now
        </button>

      </div>

    </div>
  )
}