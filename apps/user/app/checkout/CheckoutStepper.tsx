"use client"

type Props = {
  step: number
}

export default function CheckoutStepper({ step }: Props) {

  const steps = [
    { id: 1, label: "Cart" },
    { id: 2, label: "Order Summary" },
    { id: 3, label: "Order Success" },
  ]

  return (

    <div className="w-full mb-10">

      <div className="flex items-center justify-between relative">

        {/* progress line */}
        <div className="absolute top-4 left-0 w-full h-[3px] bg-gray-200 z-0" />

        <div
          className="absolute top-4 left-0 h-[3px] bg-blue-600 z-0 transition-all duration-500"
          style={{
            width:
              step === 1
                ? "0%"
                : step === 2
                ? "50%"
                : "100%"
          }}
        />

        {steps.map((s, i) => {

          const completed = step > s.id
          const active = step === s.id

          return (

            <div
              key={s.id}
              className="flex flex-col items-center relative z-10 flex-1"
            >

              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition-all
                ${
                  completed
                    ? "bg-blue-600 border-blue-600 text-white"
                    : active
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
              >

                {completed ? "✓" : s.id}

              </div>

              <span
                className={`mt-2 text-sm font-medium
                ${
                  active
                    ? "text-blue-600"
                    : completed
                    ? "text-gray-800"
                    : "text-gray-400"
                }`}
              >
                {s.label}
              </span>

            </div>

          )
        })}

      </div>

    </div>

  )
}
