"use client";

import Image from "next/image";
import { Product } from "../hooks/useProducts";

type Props = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: Props) {
  if (!product) return null;

  const prices = product.variants.map(v => v.sellingPrice ?? 0);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded">
                #{product.id}
              </span>

              {product.technicalName && (
                <span
                  onClick={() =>
                    navigator.clipboard.writeText(product.technicalName!)
                  }
                  className="bg-black text-white px-2 py-0.5 rounded cursor-pointer hover:bg-gray-800"
                >
                  {product.technicalName.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 grid md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">

          {/* LEFT → IMAGES */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              {product.images?.length ? (
                product.images.map(img => (
                  <div
                    key={img.id}
                    className="border rounded-xl overflow-hidden group"
                  >
                    <Image
                      src={img.url}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-cover w-full h-40 group-hover:scale-105 transition"
                    />
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">
                  No images available
                </div>
              )}
            </div>
          </div>

          {/* RIGHT → DETAILS */}
          <div className="space-y-5">

            {/* PRICE */}
            <div className="border rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Price Range</p>
              <p className="text-2xl font-bold text-gray-900">
                {min === max ? `₹${min}` : `₹${min} – ₹${max}`}
              </p>
            </div>

            {/* INFO */}
            <div className="grid grid-cols-2 gap-4 text-sm border rounded-xl p-4">

              <div>
                <p className="text-gray-500 text-xs">Category</p>
                <p className="font-medium">
                  {product.category?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Brand</p>
                <p className="font-medium">
                  {product.brand?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${
                    product.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Variants</p>
                <p>{product.variants.length}</p>
              </div>

              <div className="col-span-2">
                <p className="text-gray-500 text-xs">Created</p>
                <p>
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>

              {product.technicalName && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Technical Name</p>
                  <p className="font-medium break-all">
                    {product.technicalName}
                  </p>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div className="border rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Description</p>
                <p className="text-sm text-gray-700">
                  {product.description}
                </p>
              </div>
            )}

          </div>

          {/* FULL WIDTH VARIANTS */}
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-3">
              Variants ({product.variants.length})
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
              {product.variants.map(v => {
                const discount =
                  v.mrp && v.sellingPrice && v.mrp > v.sellingPrice
                    ? Math.round(
                        ((v.mrp - v.sellingPrice) / v.mrp) * 100
                      )
                    : 0;

                return (
                  <div
                    key={v.id}
                    className="border rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">

                      {/* LEFT */}
                      <div>
                        <p className="font-medium text-gray-900">
                          {v.name} ({v.value} {v.unit})
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          ID: #{v.id}
                        </p>

                        <p className="text-xs text-gray-500">
                          Stock: {v.stock}
                        </p>
                      </div>

                      {/* RIGHT */}
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">
                          ₹{v.sellingPrice ?? 0}
                        </p>

                        {v.mrp && (
                          <p className="text-xs line-through text-gray-400">
                            ₹{v.mrp}
                          </p>
                        )}

                        {discount > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            {discount}% OFF
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}