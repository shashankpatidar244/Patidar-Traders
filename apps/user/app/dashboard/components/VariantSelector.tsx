"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, ChevronRight } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";

type Variant = {
  id: number;
  value: string;
  mrp?: number;
  sellingPrice?: number;
  stock?: number;
};

type Product = {
  name?: string;
  brand?: {
    name?: string;
  };
  images?: {
    url: string;
  }[];
};

type Props = {
  variants: Variant[];
  value: number | null;
  onChange: (id: number) => void;
  label?: string;
  product?: Product;
  productId: number;
};

export default function VariantSelector({
  variants,
  value,
  onChange,
  label = "Size",
  product,
  productId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!variants?.length) return null;

  const selectedVariant = variants.find((v) => v.id === value);

  return (
    <>
      {/* SELECT BUTTON */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 flex items-center justify-between hover:border-black transition"
        >
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500">{label}</span>

            <span className="font-semibold text-sm text-black">
              {selectedVariant?.value || "Select Variant"}
            </span>
          </div>

          <ChevronRight size={18} className="text-gray-500" />
        </button>
      </div>

      {/* MODAL */}
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-2 sm:p-4">
            {/* BACKDROP */}
            <div className="absolute inset-0" onClick={() => setOpen(false)} />

            {/* CONTAINER */}
            <div className="relative bg-[#f7f7f7] w-full max-w-[420px] sm:max-w-[520px] rounded-t-[26px] sm:rounded-[28px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* CLOSE */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X size={16} className="text-gray-700" />
              </button>

              {/* HEADER */}
              <div className="px-4 pt-4 pb-4 bg-white border-b border-gray-100">
                <div className="flex gap-3">
                  {/* IMAGE */}
                  <div className="w-[88px] h-[88px] rounded-xl bg-[#f6f6f6] border overflow-hidden shrink-0">
                    <img
                      src={product?.images?.[0]?.url || "/placeholder.png"}
                      alt={product?.name || "Product"}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0 pr-8 flex flex-col justify-center">
                    {/* BRAND */}
                    {product?.brand?.name && (
                      <p className="text-[11px] uppercase tracking-wide text-[#2d9b4d] font-semibold">
                        {product.brand.name}
                      </p>
                    )}

                    {/* NAME */}
                    <h2 className="mt-1 text-[15px] leading-[21px] font-semibold text-black line-clamp-2">
                      {product?.name}
                    </h2>

                    {/* ACTIONS */}
                    <div className="mt-4 flex items-center gap-3">
                      {/* GO TO CART */}
                      <a
                        href="/cart"
                        className="inline-flex items-center justify-center h-[36px] px-4 rounded-lg bg-[#2d9b4d] hover:bg-[#24853f] text-white text-[13px] font-medium transition"
                      >
                        Go to Cart
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* TITLE */}
              <div className="px-4 py-3">
                <h3 className="text-[18px] font-semibold text-black">
                  Choose a {label}
                </h3>
              </div>

              {/* VARIANTS */}
              <div className="overflow-y-auto max-h-[58vh] px-2 pb-3 space-y-2">
                {variants.map((variant) => {
                  const price = variant.sellingPrice ?? 0;

                  const originalPrice = variant.mrp ?? 0;

                  const discount =
                    originalPrice > 0
                      ? Math.round(
                          ((originalPrice - price) / originalPrice) * 100
                        )
                      : 0;

                  const saved = originalPrice > 0 ? originalPrice - price : 0;

                  const inStock = (variant.stock ?? 0) > 0;

                  return (
                    <div
                      key={variant.id}
                      onClick={() => {
                        onChange(variant.id);
                      }}
                      className={`cursor-pointer rounded-xl px-4 py-4 shadow-sm border transition-all
                        ${
                          value === variant.id
                            ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                            : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/40"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* LEFT */}
                        <div className="flex-1 min-w-0">
                          {/* SIZE */}
                          <h4 className="text-[18px] font-semibold text-black leading-none">
                            {variant.value}
                          </h4>

                          {/* PRICE */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[20px] font-bold text-black">
                              ₹{price}
                            </span>

                            {originalPrice > 0 && (
                              <span className="text-[13px] text-gray-400 line-through">
                                ₹{originalPrice}
                              </span>
                            )}

                            {discount > 0 && (
                              <span className="bg-[#f89a1c] text-white text-[10px] font-semibold px-2 py-[3px] rounded-md">
                                {discount}% OFF
                              </span>
                            )}
                          </div>

                          {/* SAVE */}
                          {saved > 0 && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-[#34a853] flex items-center justify-center text-white text-[9px] font-bold">
                                %
                              </div>

                              <span className="text-[#34a853] text-[13px] font-medium">
                                Save ₹{saved}
                              </span>
                            </div>
                          )}

                          {/* STOCK */}
                          <div className="mt-1.5">
                            {inStock ? (
                              <span className="text-[11px] font-medium text-[#34a853]">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-red-500">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div
                          className="w-[135px] shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AddToCartButton
                            productId={productId}
                            variantId={variant.id}
                            stock={variant.stock || 0}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
