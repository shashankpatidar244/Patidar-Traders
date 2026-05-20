import { getStockStatus } from "../../../lib/inventory"

export default function StockBadge({ stock }: { stock: number }) {
  const status = getStockStatus(stock)

  let color = "text-green-600"

  if (status === "OUT") color = "text-red-700"
  if (status === "LOW") color = "text-red-500"
  if (status === "MEDIUM") color = "text-yellow-500"

  return <span className={color}>{stock}</span>
}