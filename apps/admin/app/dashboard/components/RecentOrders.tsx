"use client"

type Order = {
  id: number
  total: number
  status: string
  paymentMethod: string
  createdAt: string
  user?: {
    phone?: string
    username?: string
  }
}

export default function RecentOrders({ orders }: { orders: Order[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700"
      case "COMPLETED":
      case "DELIVERED":
        return "bg-green-100 text-green-700"
      case "CANCELLED":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getPaymentColor = (method: string) => {
    return method === "COD"
      ? "bg-orange-100 text-orange-700"
      : "bg-blue-100 text-blue-700"
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">
          Latest Orders
        </h2>
        <span className="text-xs text-gray-400">
          {orders?.length || 0} orders
        </span>
      </div>

      {/* Empty State */}
      {!orders || orders.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-10">
          No recent orders
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700">

          <table className="w-full text-sm">
            
            {/* Header */}
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  
                  {/* Order ID */}
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                    #{o.id}
                  </td>

                  {/* User */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {o.user?.phone || o.user?.username || "Guest"}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">
                    ₹{(o.total ?? 0).toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentColor(
                        o.paymentMethod
                      )}`}
                    >
                      {o.paymentMethod}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-xs text-gray-400 text-right">
        Showing latest orders
      </div>
    </div>
  )
}