export default function PaymentStats({ data }: any) {
    const paid = data.filter((p: any) => p.paymentStatus === "PAID")
    const pending = data.filter((p: any) => p.paymentStatus === "PENDING")
    const failed = data.filter((p: any) => p.paymentStatus === "FAILED")
    const cod = data.filter((p: any) => p.paymentMethod === "COD")
  
    const revenue = paid.reduce((acc: number, p: any) => acc + p.total, 0)
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={`₹${revenue}`}
          highlight
        />
  
        <StatCard
          title="Pending Payments"
          value={pending.length}
        />
  
        <StatCard
          title="Failed Payments"
          value={failed.length}
        />
  
        <StatCard
          title="COD Orders"
          value={cod.length}
        />
      </div>
    )
  }
  
  function StatCard({
    title,
    value,
    icon,
    highlight = false,
  }: any) {
    return (
      <div
        className={`rounded-xl p-5 border bg-white shadow-sm hover:shadow-md transition
          ${highlight ? "border-black" : "border-gray-200"}
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">{title}</p>
          <span className="text-xl">{icon}</span>
        </div>
  
        <h2 className="text-2xl font-semibold text-gray-900">
          {value}
        </h2>
  
        {/* Optional subtle footer */}
        <p className="text-xs text-gray-400 mt-1">
          Updated just now
        </p>
      </div>
    )
  }