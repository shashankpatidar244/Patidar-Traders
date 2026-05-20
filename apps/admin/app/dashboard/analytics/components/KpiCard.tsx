export default function KpiCard({ title, value, growth, active }: any) {
  return (
    <div
      className={`p-5 rounded-2xl shadow border cursor-pointer transition-all
        ${active
          ? "bg-indigo-50 border-indigo-500 scale-[1.02]"
          : "bg-white hover:shadow-md"}
      `}
    >
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="text-2xl font-bold">{value}</h2>

      {growth !== undefined && (
        <p
          className={`text-sm mt-1 ${
            growth >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {growth >= 0 ? "↑" : "↓"} {growth.toFixed(1)}%
        </p>
      )}
    </div>
  )
}