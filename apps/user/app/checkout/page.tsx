import CheckoutClient from "./CheckoutClient"
import CheckoutStepper from "./CheckoutStepper"

export default function CheckoutPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">

      <CheckoutStepper step={2} />

      {/* Order Summary + Checkout UI */}
      <CheckoutClient />

    </div>
  )
}
