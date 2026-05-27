"use client";

import { useState, useEffect } from "react";
import ProductRow from "./ProductRow";
import InventoryHistory from "./InventoryHistory";

export default function InventoryTable({ data, selected, setSelected }: any) {
  // LOCAL STATE
  const [rows, setRows] = useState(data);

  const [open, setOpen] = useState<{
    [key: number]: boolean;
  }>({});

  const [historyId, setHistoryId] = useState<number | null>(null);

  // UPDATE LOCAL ROWS WHEN API DATA CHANGES
  useEffect(() => {
    setRows(data || []);
  }, [data]);

  // OPTIMISTIC STOCK UPDATE
  function updateLocalStock(id: number, action: string, value: number) {
    setRows((prev: any[]) =>
      prev.map((product: any) => ({
        ...product,

        variants: (product.variants || []).map((variant: any) => {
          if (variant.id !== id) {
            return variant;
          }

          let newStock = variant.stock;

          if (action === "ADD") {
            newStock += value;
          }

          if (action === "REDUCE") {
            newStock = Math.max(0, newStock - value);
          }

          if (action === "SET") {
            newStock = value;
          }

          return {
            ...variant,
            stock: newStock,
            updatedAt: new Date().toISOString(),
          };
        }),
      }))
    );
  }

  // TOGGLE PRODUCT
  function toggle(id: number) {
    setOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm w-full overflow-hidden">
      <div className="overflow-x-auto w-full">
        <div className="min-w-[800px] inline-block w-full align-middle">
          
          {/* PRODUCT LIST */}
          {rows.map((product: any) => (
            <ProductRow
              key={product.id}
              group={{
                product,
                variants: product.variants || [],
              }}
              open={open[product.id]}
              toggle={() => toggle(product.id)}
              selected={selected}
              setSelected={setSelected}
              updateLocalStock={updateLocalStock}
              onHistory={setHistoryId}
            />
          ))}

        </div>
      </div>

      {/* HISTORY MODAL */}
      {historyId && (
        <InventoryHistory
          variantId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}
    </div>
  );
}
