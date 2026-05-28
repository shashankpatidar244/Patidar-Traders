"use client";

interface PaymentStatsProps {
  data: any[];
}

export default function PaymentStats({ data }: PaymentStatsProps) {
  // PAYMENT STATUS
  const paid = data.filter((p: any) => p.paymentStatus === "PAID");

  const pending = data.filter((p: any) => p.paymentStatus === "PENDING");

  const failed = data.filter((p: any) => p.paymentStatus === "FAILED");

  const refunded = data.filter((p: any) => p.paymentStatus === "REFUNDED");

  // PAYMENT METHODS
  const cod = data.filter((p: any) => p.paymentMethod === "COD");

  const upi = data.filter((p: any) => p.paymentMethod === "UPI");

  const card = data.filter((p: any) => p.paymentMethod === "CARD");

  const online = [...upi, ...card];

  // DELIVERY STATUS
  const delivered = data.filter((p: any) => p.deliveryStatus === "DELIVERED");

  const shipped = data.filter((p: any) => p.deliveryStatus === "SHIPPED");

  // DECIMAL SAFE TOTALS
  const revenue = paid.reduce(
    (acc: number, p: any) => acc + Number(p.total || 0),
    0
  );

  const refundedAmount = refunded.reduce(
    (acc: number, p: any) => acc + Number(p.total || 0),
    0
  );

  // SUCCESS RATE
  const successRate =
    data.length > 0 ? ((paid.length / data.length) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-8 gap-4">
      {/* REVENUE */}
      <StatCard
        title="Revenue"
        value={`₹${revenue.toLocaleString("en-IN")}`}
        icon="💰"
        highlight
        subtitle={`${paid.length} paid orders`}
      />

      {/* PENDING */}
      <StatCard
        title="Pending"
        value={pending.length}
        icon="⏳"
        subtitle="Awaiting payment"
      />

      {/* FAILED */}
      <StatCard
        title="Failed"
        value={failed.length}
        icon="❌"
        subtitle="Payment failures"
      />

      {/* REFUNDED */}
      <StatCard
        title="Refunded"
        value={`₹${refundedAmount.toLocaleString("en-IN")}`}
        icon="↩️"
        subtitle={`${refunded.length} refunded`}
      />

      {/* COD */}
      <StatCard
        title="COD"
        value={cod.length}
        icon="📦"
        subtitle="Cash on delivery"
      />

      {/* ONLINE */}
      <StatCard
        title="Online"
        value={online.length}
        icon="💳"
        subtitle="UPI & Card"
      />

      {/* SHIPPED */}
      <StatCard
        title="Shipped"
        value={shipped.length}
        icon="🚚"
        subtitle="In transit"
      />

      {/* SUCCESS */}
      <StatCard
        title="Success"
        value={`${successRate}%`}
        icon="📈"
        subtitle={`${delivered.length} delivered`}
      />
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, highlight = false }: any) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border bg-white p-5
        shadow-sm transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${highlight ? "border-black" : "border-gray-200"}
      `}
    >
      {/* TOP */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900 truncate">
            {value}
          </h2>
        </div>

        <div
          className={`
            h-11 w-11 rounded-xl flex items-center justify-center text-lg shrink-0
            ${highlight ? "bg-black text-white" : "bg-gray-100 text-gray-700"}
          `}
        >
          {icon}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>

        <span className="text-[10px] text-gray-300 shrink-0">LIVE</span>
      </div>

      {/* GLOW */}
      {highlight && (
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-black/5 blur-2xl" />
      )}
    </div>
  );
}
