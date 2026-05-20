export default function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
        Out of Stock
      </span>
    )

  if (stock < 10)
    return (
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
        Low Stock
      </span>
    )

  return (
    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
      In Stock
    </span>
  )
}