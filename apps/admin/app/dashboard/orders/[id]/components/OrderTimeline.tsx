export default function OrderTimeline({ status }: { status: string }) {
  const steps = ["PENDING", "PAID", "SHIPPED", "DELIVERED"]

  const currentIndex = steps.indexOf(status)

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">

      <h2 className="text-sm font-semibold text-gray-500 mb-6">
        ORDER TIMELINE
      </h2>

      <div className="flex items-center justify-between">

        {steps.map((step, index) => {
          const active = index <= currentIndex

          return (
            <div key={step} className="flex-1 flex items-center">

              {/* STEP */}
              <div className="flex flex-col items-center w-full">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
                  ${active ? "bg-green-500" : "bg-gray-300"}`}
                >
                  {active ? "✓" : index + 1}
                </div>

                <span
                  className={`text-xs mt-2 font-medium
                  ${active ? "text-green-600" : "text-gray-400"}`}
                >
                  {step}
                </span>
              </div>

              {/* LINE */}
              {index !== steps.length - 1 && (
                <div
                  className={`h-1 w-full 
                  ${index < currentIndex ? "bg-green-500" : "bg-gray-200"}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* CANCELLED */}
      {status === "CANCELLED" && (
        <div className="mt-6 text-center text-red-600 font-medium">
          ❌ Order Cancelled
        </div>
      )}
    </div>
  )
}