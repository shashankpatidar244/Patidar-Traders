"use client";

export default function VariantRow({ variants, mutate }: any) {

  async function deleteVariant(id: number) {
    if (!confirm("Delete this variant?")) return;

    await fetch(`/api/products/variant/${id}`, {
      method: "DELETE",
    });

    mutate();
  }

  return (
    <tr className="bg-gray-50">
      <td colSpan={9} className="p-4">
        <div className="space-y-3">

          {variants.map((v: any) => {
            const discount =
              v.mrp && v.sellingPrice && v.mrp > v.sellingPrice
                ? Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100)
                : 0;

            return (
              <div
                key={v.id}
                className="flex justify-between items-center border rounded-xl px-4 py-3 bg-white hover:shadow-md transition"
              >

                {/* LEFT SIDE */}
                <div className="flex flex-col gap-1">

                  {/* ID */}
                  <span className="text-[11px] text-gray-400">
                    ID: #{v.id}
                  </span>

                  {/* NAME */}
                  <span className="font-medium text-gray-900">
                    {v.name} ({v.value} {v.unit})
                  </span>

                  {/* STOCK */}
                  <span className="text-xs text-gray-500">
                    Stock: {v.stock}
                  </span>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-6">

                  {/* PRICE SECTION */}
                  <div className="text-right">

                    {/* SELLING */}
                    <p className="font-semibold text-gray-900 text-sm">
                      ₹{v.sellingPrice ?? 0}
                    </p>

                    {/* MRP */}
                    {v.mrp && (
                      <p className="text-xs line-through text-gray-400">
                        ₹{v.mrp}
                      </p>
                    )}

                    {/* DISCOUNT */}
                    {discount > 0 && (
                      <p className="text-[11px] text-green-600 font-medium">
                        {discount}% OFF
                      </p>
                    )}
                  </div>

                  {/* ACTION */}
                  <button
                    onClick={() => deleteVariant(v.id)}
                    className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition"
                  >
                    Delete
                  </button>

                </div>
              </div>
            );
          })}

        </div>
      </td>
    </tr>
  );
}