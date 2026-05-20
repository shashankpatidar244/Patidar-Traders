export default function OrderCustomer({ user }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">

      <h2 className="text-sm font-semibold text-gray-500 mb-3">
        CUSTOMER DETAILS
      </h2>

      <div className="space-y-1">
        <p className="font-medium text-gray-800">
          {user.username || "Guest User"}
        </p>

        <p className="text-sm text-gray-600">
          {user.phone}
        </p>
      </div>

    </div>
  )
}