"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ImageUploader from "../components/ImageUploader"

export default function ProductForm({ product }: any) {
  const router = useRouter()

  const [name, setName] = useState(product.name)

  const [images, setImages] = useState(
    product.images.map((i: any) => i.url)
  )

  const [variants, setVariants] = useState(
    product.variants.map((v: any) => ({
      ...v,
      mrp: v.mrp ?? 0,
      sellingPrice: v.sellingPrice ?? 0,
    }))
  )

  const [loading, setLoading] = useState(false)

  function addVariant() {
    setVariants([
      ...variants,
      {
        value: "",
        unit: "KG",
        mrp: 0,
        sellingPrice: 0,
        stock: 0,
      },
    ])
  }

  function updateVariant(index: number, field: string, value: any) {
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  function removeVariant(index: number) {
    const updated = variants.filter((_: any, i: number) => i !== index)
    setVariants(updated)
  }

  async function handleSubmit() {
    setLoading(true)

    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name,
        images,
        variants,
      }),
    })

    setLoading(false)
    router.push("/dashboard/products")
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* NAME */}
      <div>
        <label className="block mb-1 font-medium">Product Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* IMAGES */}
      <div>
        <label className="block mb-1 font-medium">Images</label>
        <ImageUploader images={images} setImages={setImages} />
      </div>

      {/* VARIANTS */}
      <div>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Variants</h2>
          <button
            onClick={addVariant}
            className="bg-black text-white px-3 py-1 rounded"
          >
            + Add Variant
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {variants.map((v: any, i: number) => {

            const discount =
              v.mrp && v.sellingPrice && v.mrp > v.sellingPrice
                ? Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100)
                : 0

            return (
              <div
                key={i}
                className="border rounded-xl p-4 bg-gray-50"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

                  {/* VALUE */}
                  <div>
                    <label className="text-xs text-gray-500">Value</label>
                    <input
                      value={v.value}
                      onChange={(e) =>
                        updateVariant(i, "value", e.target.value)
                      }
                      className="w-full border p-2 rounded mt-1"
                    />
                  </div>

                  {/* UNIT */}
                  <div>
                    <label className="text-xs text-gray-500">Unit</label>
                    <select
                      value={v.unit}
                      onChange={(e) =>
                        updateVariant(i, "unit", e.target.value)
                      }
                      className="w-full border p-2 rounded mt-1"
                    >
                      <option>KG</option>
                      <option>GM</option>
                      <option>L</option>
                      <option>ML</option>
                    </select>
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="text-xs text-gray-500">MRP</label>
                    <input
                      type="number"
                      value={v.mrp}
                      onChange={(e) =>
                        updateVariant(i, "mrp", Number(e.target.value))
                      }
                      className="w-full border p-2 rounded mt-1"
                    />
                  </div>

                  {/* SELLING PRICE */}
                  <div>
                    <label className="text-xs text-gray-500">
                      Selling Price
                    </label>
                    <input
                      type="number"
                      value={v.sellingPrice}
                      onChange={(e) =>
                        updateVariant(
                          i,
                          "sellingPrice",
                          Number(e.target.value)
                        )
                      }
                      className="w-full border p-2 rounded mt-1"
                    />
                  </div>

                  {/* STOCK */}
                  <div>
                    <label className="text-xs text-gray-500">Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, "stock", Number(e.target.value))
                      }
                      className="w-full border p-2 rounded mt-1"
                    />
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-center mt-3">

                  {/* Discount */}
                  {discount > 0 && (
                    <span className="text-green-600 text-sm font-medium">
                      {discount}% OFF
                    </span>
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => removeVariant(i)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {loading ? "Updating..." : "Update Product"}
      </button>
    </div>
  )
}