"use client"

import CheckoutStepper from "../checkout/CheckoutStepper"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OrderSuccess() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard/orders")
    }, 4000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="max-w-6xl mx-auto p-6">

      <CheckoutStepper step={3} />

      <h1 className="text-3xl font-bold text-green-600 mt-6">
        Order Placed Successfully
      </h1>

      <p className="mt-4 text-gray-600">
        Thank you for shopping with us. Redirecting you to your orders...
      </p>

      <a
        href="/dashboard/orders"
        className="mt-6 inline-block bg-black text-white px-6 py-3 rounded"
      >
        View Orders
      </a>

    </div>
  )
}
