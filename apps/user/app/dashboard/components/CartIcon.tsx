"use client"

import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function CartIcon() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function loadCount() {
      const res = await fetch("/api/cart/count")
      const data = await res.json()
      setCount(data.count)
    }

    loadCount()
  }, [])

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart size={22} />

      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </Link>
  )
}