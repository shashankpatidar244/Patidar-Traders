"use client";

type Props = {
  selectedProducts: number[];
  onAction: (action: string) => void;
};

export default function BulkActions({
  selectedProducts,
  onAction,
}: Props) {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-gray-100 border rounded-lg px-4 py-3">

      {/* COUNT */}
      <span className="text-sm font-medium text-gray-700">
        {selectedProducts.length} selected
      </span>

      {/* ACTIONS */}
      <button
        onClick={() => onAction("activate")}
        className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Activate
      </button>

      <button
        onClick={() => onAction("deactivate")}
        className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
      >
        Deactivate
      </button>

      <button
        onClick={() => onAction("delete")}
        className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 ml-auto"
      >
        Delete
      </button>
    </div>
  );
}