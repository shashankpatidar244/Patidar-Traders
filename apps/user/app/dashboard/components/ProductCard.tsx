"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { Heart } from "lucide-react";
import VariantSelector from "./VariantSelector";

type Variant = {
  id: number;
  value: string;
  mrp?: number | null;
  sellingPrice?: number | null;
};

export default function ProductCard({ product }: any) {
  const images = product.images || [];
  const [imageIndex, setImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function startSlider() {
    if (!images.length) return;
    intervalRef.current = setInterval(() => {
      setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 1800);
  }

  function stopSlider() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setImageIndex(0);
  }

  const [variantId, setVariantId] = useState<number | null>(
    product.variants?.[0]?.id || null
  );

  const selectedVariant = product.variants?.find(
    (v: Variant) => v.id === variantId
  );

  const mrp = selectedVariant?.mrp;
  const sellingPrice = selectedVariant?.sellingPrice;

  const discount =
    mrp && sellingPrice && mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  return (
    <div className="group border rounded-2xl p-4 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div
        className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden"
        onMouseEnter={startSlider}
        onMouseLeave={stopSlider}
      >
        <Link href={`/products/${product.id}`}>
          {images.length > 0 ? (
            <Image
              src={images[imageIndex].url}
              alt={product.name}
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
        </Link>

        {/* Wishlist */}
        <button className="absolute top-3 right-3 bg-white/90 shadow-sm backdrop-blur p-2 rounded-full hover:bg-white transition">
          <Heart size={16} className="text-gray-700" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_: any, i: number) => (
            <div
              key={i}
              className={`h-1.5 w-3 rounded-full transition-all ${
                imageIndex === i ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-400 text-xs">{product.category?.name}</p>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          {sellingPrice && (
            <p className="text-base font-semibold text-gray-900">
              ₹{sellingPrice}
            </p>
          )}

          {mrp && sellingPrice && mrp > sellingPrice && (
            <p className="text-xs text-gray-400 line-through">₹{mrp}</p>
          )}

          {discount > 0 && (
            <span className="text-xs text-green-600 font-medium">
              {discount}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector */}
      <div className="mt-3">
        <VariantSelector
          variants={product.variants || []}
          value={variantId}
          onChange={setVariantId}
          product={product}
          productId={product.id}
        />
      </div>
    </div>
  );
}
