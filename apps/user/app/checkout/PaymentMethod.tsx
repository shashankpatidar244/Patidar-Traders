"use client"

type PaymentMethodType = "COD" | "ONLINE"

interface Props {
  method: PaymentMethodType
  setMethod: (value: PaymentMethodType) => void
}

export default function PaymentMethod({ method, setMethod }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Payment Method
      </h2>

      {/* ONLINE */}
      <label
        className={`flex items-center gap-3 border p-4 rounded mb-3 cursor-pointer transition
        ${method === "ONLINE" ? "border-black bg-gray-100" : "border-gray-300"}`}
      >
        <input
          type="radio"
          name="paymentMethod"
          checked={method === "ONLINE"}
          onChange={() => setMethod("ONLINE")}
        />

        <div>
          <p className="font-medium">Pay Online</p>
          <p className="text-sm text-gray-500">
            UPI / Cards / Netbanking (Razorpay)
          </p>
        </div>
      </label>

      {/* COD */}
      <label
        className={`flex items-center gap-3 border p-4 rounded cursor-pointer transition
        ${method === "COD" ? "border-black bg-gray-100" : "border-gray-300"}`}
      >
        <input
          type="radio"
          name="paymentMethod"
          checked={method === "COD"}
          onChange={() => setMethod("COD")}
        />

        <div>
          <p className="font-medium">Cash on Delivery</p>
          <p className="text-sm text-gray-500">
            Pay when order arrives
          </p>
        </div>
      </label>
    </div>
  )
}