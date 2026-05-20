"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import StockBadge from "./StockBadge";
import VariantRow from "./VariantRow";
import { Variant } from "../hooks/useProducts";

export default function ProductRow({
  product: p,
  selected,
  toggle,
  setSelectedProduct,
  expandedRow,
  setExpandedRow,
  mutate,
}: any) {
  const router = useRouter();

  const totalStock = p.variants.reduce(
    (acc: number, v: Variant) => acc + v.stock,
    0
  );

  const prices = p.variants.map((v: Variant) => v.sellingPrice ?? 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  async function handleDelete() {
    if (!confirm("Delete this product?")) return;

    await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <>
      <tr
        className="hover:bg-gray-50 transition cursor-pointer"
        onClick={() => setSelectedProduct(p)}
      >
        {/* CHECKBOX */}
        <td className="px-4" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected.includes(p.id)}
            onChange={() => toggle(p.id)}
          />
        </td>

        {/* PRODUCT */}
        <td className="px-4">
          <div className="flex gap-3 items-center min-w-0">
            <Image
              src={p.images?.[0]?.url || "/placeholder.png"}
              alt={p.name}
              width={52}
              height={52}
              className="rounded-lg border object-cover"
            />

            <div className="flex flex-col truncate">
              <p className="font-semibold text-gray-900 truncate">{p.name}</p>

              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="bg-gray-100 px-2 py-0.5 rounded">#{p.id}</span>

                <span className="text-gray-300">•</span>

                <span className="text-blue-600 font-medium">
                  {p.variants.length} variants
                </span>
              </div>
            </div>
          </div>
        </td>

        {/* CATEGORY */}
        <td className="px-4 text-gray-600">{p.category?.name || "—"}</td>

        {/* BRAND */}
        <td className="px-4 text-gray-600">{p.brand?.name || "—"}</td>

        {/* PRICE */}
        <td
          className="px-4 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setExpandedRow((prev: number | null) =>
              prev === p.id ? null : p.id
            );
          }}
        >
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-900">
              {min === max ? `₹${min}` : `₹${min} – ₹${max}`}
            </span>
            <span className="text-[10px] text-blue-500">
              Click to view variants
            </span>
          </div>
        </td>

        {/* STOCK */}
        <td className="text-center">
          <StockBadge stock={totalStock} />
        </td>

        {/* STATUS */}
        <td className="text-center">
          <StatusBadge active={p.isActive} />
        </td>

        {/* DATE */}
        <td className="text-center text-xs text-gray-500">
          {new Date(p.createdAt).toLocaleDateString()}
        </td>

        {/* ACTIONS */}
        <td className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => router.push(`/dashboard/products/${p.id}`)}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>

      {expandedRow === p.id && (
        <VariantRow variants={p.variants} mutate={mutate} />
      )}
    </>
  );
}
