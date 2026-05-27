export default function PaymentStats({ data }: any) {
  const paid = data.filter(
    (p: any) => p.paymentStatus === "PAID"
  )
  const pending = data.filter(
    (p: any) => p.paymentStatus === "PENDING"
  )
  const failed = data.filter(
    (p: any) => p.paymentStatus === "FAILED"
  )
  const refunded = data.filter(
    (p: any) => p.paymentStatus === "REFUNDED"
  )
  const cod = data.filter(
    (p: any) => p.paymentMethod === "COD"
  )
  const online = data.filter(
    (p: any) =>
      p.paymentMethod === "UPI" ||
      p.paymentMethod === "CARD"
  )

  // Decimal safe conversion
  const revenue = paid.reduce(
    (acc: number, p: any) =>
      acc + Number(p.total || 0),
    0
  )

  const refundedAmount = refunded.reduce(
    (acc: number, p: any) =>
      acc + Number(p.total || 0),
    0
  )

  const successRate =
    data.length > 0
      ? ((paid.length / data.length) * 100).toFixed(1)
      : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">

      {/* Revenue */}
      <StatCard
        title="Revenue"
        value={`₹${revenue.toLocaleString("en-IN")}`}
        icon="💰"
        highlight
        subtitle={`${paid.length} paid orders`}
      />

      {/* Pending */}
      <StatCard
        title="Pending"
        value={pending.length}
        icon="⏳"
        subtitle="Awaiting payment"
      />

      {/* Failed */}
      <StatCard
        title="Failed"
        value={failed.length}
        icon="❌"
        subtitle="Payment failures"
      />

      {/* Refunded */}
      <StatCard
        title="Refunded"
        value={`₹${refundedAmount.toLocaleString("en-IN")}`}
        icon="↩️"
        subtitle={`${refunded.length} refunded`}
      />

      {/* COD */}
      <StatCard
        title="COD Orders"
        value={cod.length}
        icon="📦"
        subtitle="Cash on delivery"
      />

      {/* Success Rate */}
      <StatCard
        title="Success Rate"
        value={`${successRate}%`}
        icon="📈"
        subtitle="Payment success"
      />
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
  highlight = false,
}: any) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border bg-white p-5
        shadow-sm transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${highlight ? "border-black" : "border-gray-200"}
      `}
    >

      {/* Top */}
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </h2>
        </div>

        <div
          className={`
            h-11 w-11 rounded-xl flex items-center justify-center text-lg
            ${highlight
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"}
          `}
        >
          {icon}
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {subtitle}
        </p>

        <span className="text-[10px] text-gray-300">
          LIVE
        </span>
      </div>

      {/* Decorative Glow */}
      {highlight && (
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-black/5 blur-2xl" />
      )}
    </div>
  )
}