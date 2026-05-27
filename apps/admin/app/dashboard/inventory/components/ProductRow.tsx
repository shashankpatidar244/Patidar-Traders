"use client";

import VariantRow from "./VariantRow";

export default function ProductRow({
  group,
  open,
  toggle,
  selected,
  setSelected,
  updateLocalStock,
  onHistory,
}: any) {
  const product = group.product;
  const variants = group.variants;

  const variantIds = variants.map((v: any) => v.id);

  const allSelected = variantIds.every((id: number) => selected.includes(id));

  const someSelected =
    variantIds.some((id: number) => selected.includes(id)) && !allSelected;

  function toggleAll(e: any) {
    e.stopPropagation();

    if (allSelected) {
      setSelected((prev: number[]) =>
        prev.filter((id) => !variantIds.includes(id))
      );
    } else {
      setSelected((prev: number[]) => [...new Set([...prev, ...variantIds])]);
    }
  }

  // CALCULATIONS
  const totalStock = variants.reduce((sum: number, v: any) => sum + v.stock, 0);

  const prices = variants.map((v: any) => v.sellingPrice || v.mrp || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const outCount = variants.filter((v: any) => v.stock === 0).length;
  const lowCount = variants.filter(
    (v: any) => v.stock > 0 && v.stock < 10
  ).length;

  // HEALTH STATUS
  const health =
    outCount > 0
      ? { label: "Risk", color: "bg-red-100 text-red-700" }
      : lowCount > 0
        ? { label: "Low", color: "bg-yellow-100 text-yellow-700" }
        : { label: "Healthy", color: "bg-green-100 text-green-700" };

  return (
    <div className="border-b bg-white w-full">
      {/* PRODUCT HEADER (CARD STYLE) */}
      <div
        onClick={toggle}
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition min-w-full w-max md:w-full gap-8"
      >
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 shrink-0">
          {/* CHECKBOX */}
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={toggleAll}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 accent-black shrink-0"
          />

          {/* EXPAND ICON */}
          <div className="text-gray-500 text-lg w-4 text-center shrink-0">{open ? "▾" : "▸"}</div>

          {/* IMAGE */}
          <img
            src={product.images?.[0]?.url}
            className="w-14 h-14 rounded-xl object-cover border shadow-sm shrink-0"
          />

          {/* INFO BLOCK */}
          <div className="flex flex-col">
            {/* NAME */}
            <p className="font-semibold text-gray-900 text-[15px]">
              {product.name}
            </p>

            {/* META */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="font-mono">#{product.id}</span>
              <span>•</span>
              <span>{variants.length} variants</span>
            </div>

            {/* PRICE RANGE */}
            <div className="text-sm text-gray-800 mt-1 font-medium">
              ₹{minPrice}
              {minPrice !== maxPrice && (
                <span className="text-gray-400"> — ₹{maxPrice}</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-8 shrink-0">
          {/* HEALTH BADGE */}
          <div
            className={`text-xs px-3 py-1 rounded-full font-medium ${health.color} whitespace-nowrap `}
          >
            {health.label}
          </div>

          {/* STOCK ALERTS */}
          <div className="flex gap-2 text-xs whitespace-nowrap">
            {outCount > 0 && (
              <span className="px-2 py-1 rounded bg-red-50 text-red-600">
                {outCount} Out
              </span>
            )}
            {lowCount > 0 && (
              <span className="px-2 py-1 rounded bg-yellow-50 text-yellow-600">
                {lowCount} Low
              </span>
            )}
          </div>

          {/* TOTAL STOCK */}
          <div className="text-right min-w-[60px]">
            <p className="font-bold text-lg text-gray-900 leading-none">
              {totalStock}
            </p>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Stock</p>
          </div>
        </div>
      </div>

      {/* VARIANTS */}
      {open && (
        <div className="bg-gray-50 border-t w-full">
          {/* LABEL ROW */}
          <div className="grid grid-cols-[50px_80px_2fr_1.3fr_1fr_1.2fr_1.4fr_1.5fr] px-6 py-2 text-[11px] font-semibold text-gray-500 uppercase bg-gray-100 border-t whitespace-nowrap">
            <div className="text-center">✓</div>
            <div className="text-center">ID</div>
            <div>Variant</div>
            <div>Price</div>
            <div>Stock</div>
            <div>Status</div>
            <div>Updated</div>
            <div className="text-right pr-2">Actions</div>
          </div>

          {/* VARIANTS */}
          {variants.map((v: any) => (
            <VariantRow
              key={v.id}
              variant={v}
              selected={selected}
              setSelected={setSelected}
              updateLocalStock={updateLocalStock}
              onHistory={onHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
