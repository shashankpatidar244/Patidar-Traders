"use client"

export default function VariantManager({ variants, setVariants }: any) {

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

  function updateVariant(index: number, key: string, value: any) {
    const updated = [...variants]

    // Convert numbers safely
    if (["mrp", "sellingPrice", "stock"].includes(key)) {
      value = Number(value)
    }

    updated[index][key] = value

    // ✅ RULE: MRP >= Selling Price
    const mrp = updated[index].mrp || 0
    const sp = updated[index].sellingPrice || 0

    // If selling price > mrp → auto fix
    if (key === "sellingPrice" && value > mrp) {
      updated[index].mrp = value
    }

    // If mrp < selling price → auto fix
    if (key === "mrp" && value < sp) {
      updated[index].sellingPrice = value
    }

    setVariants(updated)
  }

  function removeVariant(index: number) {
    const updated = variants.filter((_: any, i: number) => i !== index)
    setVariants(updated)
  }

  return (
    <div>
      <h3 className="font-bold mb-4 text-lg">Variants</h3>

      {variants.map((v: any, i: number) => {

        const discount =
          v.mrp && v.sellingPrice && v.mrp > v.sellingPrice
            ? Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100)
            : 0

        return (
          <div
            key={i}
            className="border rounded-xl p-4 mb-4 bg-gray-50"
          >

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

              {/* VALUE */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">
                  Value
                </label>
                <input
                  value={v.value}
                  onChange={(e) =>
                    updateVariant(i, "value", e.target.value)
                  }
                  className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* UNIT */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">
                  Unit
                </label>
                <select
                  value={v.unit}
                  onChange={(e) =>
                    updateVariant(i, "unit", e.target.value)
                  }
                  className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option>KG</option>
                  <option>GM</option>
                  <option>L</option>
                  <option>ML</option>
                  <option>PCS</option>
                </select>
              </div>

              {/* MRP */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">
                  MRP
                </label>
                <input
                  type="number"
                  value={v.mrp}
                  onChange={(e) =>
                    updateVariant(i, "mrp", e.target.value)
                  }
                  className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* SELLING PRICE */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">
                  Selling Price
                </label>
                <input
                  type="number"
                  value={v.sellingPrice}
                  onChange={(e) =>
                    updateVariant(i, "sellingPrice", e.target.value)
                  }
                  className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* STOCK */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(i, "stock", e.target.value)
                  }
                  className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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

      {/* ADD BUTTON */}
      <button
        onClick={addVariant}
        className="text-blue-600 font-medium"
      >
        + Add Variant
      </button>
    </div>
  )
}