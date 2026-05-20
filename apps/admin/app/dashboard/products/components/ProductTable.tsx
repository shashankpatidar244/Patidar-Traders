"use client";

import { useState } from "react";
import BulkActions from "./BulkActions";
import ProductRow from "./ProductRow";
import ProductModal from "./ProductModal";
import { useProducts, Product } from "../hooks/useProducts";

export default function ProductTable() {
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { products, mutate, isLoading } = useProducts();

  function toggle(id: number) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }

  function toggleAll() {
    if (selected.length === products.length) {
      setSelected([]);
    } else {
      setSelected(products.map(p => p.id));
    }
  }

  async function handleBulkAction(action: string) {
    if (!selected.length) return;

    if (action === "delete") {
      if (!confirm("Delete selected products?")) return;
    }

    await fetch("/api/products/bulk", {
      method: "POST",
      body: JSON.stringify({ ids: selected, action }),
    });

    setSelected([]);
    mutate();
  }

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">

      <BulkActions
        selectedProducts={selected}
        onAction={handleBulkAction}
      />

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <table className="w-full text-sm table-fixed">

          {/* HEADER */}
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr className="border-b">

              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={
                    products.length > 0 &&
                    selected.length === products.length
                  }
                />
              </th>

              <th className="w-[300px] text-left px-4">Product</th>
              <th className="w-[160px] text-left">Category</th>
              <th className="w-[120px] text-left">Brand</th>
              <th className="w-[160px] text-left">Price</th>
              <th className="w-[90px] text-center">Stock</th>
              <th className="w-[120px] text-center">Status</th>
              <th className="w-[130px] text-center">Created</th>
              <th className="w-[160px] text-right pr-4">Actions</th>

            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y [&>tr]:h-[72px]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map(p => (
                <ProductRow
                  key={p.id}
                  product={p}
                  selected={selected}
                  toggle={toggle}
                  setSelectedProduct={setSelectedProduct}
                  expandedRow={expandedRow}
                  setExpandedRow={setExpandedRow}
                  mutate={mutate}
                />
              ))
            )}
          </tbody>

        </table>
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}