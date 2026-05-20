export default function StatusBadge({ status }: { status: string }) {
    const config: any = {
      PAID: {
        color: "bg-green-100 text-green-700",
        icon: "✔",
        label: "Paid",
      },
      PENDING: {
        color: "bg-yellow-100 text-yellow-700",
        icon: "⏳",
        label: "Pending",
      },
      FAILED: {
        color: "bg-red-100 text-red-700",
        icon: "✖",
        label: "Failed",
      },
      REFUNDED: {
        color: "bg-purple-100 text-purple-700",
        icon: "↩",
        label: "Refunded",
      },
    }
  
    const current = config[status] || {
      color: "bg-gray-100 text-gray-600",
      icon: "•",
      label: status,
    }
  
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${current.color}`}
      >
        <span className="text-xs">{current.icon}</span>
        <span className="tracking-wide">{current.label}</span>
      </span>
    )
  }