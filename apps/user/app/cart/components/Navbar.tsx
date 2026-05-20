
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  HeartIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline"

export default function Navbar() {

  const pathname = usePathname()

  const isCartPage = pathname === "/cart"
  const isWishlistPage = pathname === "/wishlist"

  // Dynamic label + link
  const Label = isCartPage ? "Wishlist" : "Cart"
  const Href = isCartPage ? "/wishlist" : "/cart"

  // Dynamic icon
  const Icon = isCartPage ? HeartIcon : ShoppingCartIcon

  // Counts
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    async function load() {
      const cartRes = await fetch("/api/cart")
      const cartData = await cartRes.json()
      setCartCount(cartData.length)

      const wishRes = await fetch("/api/wishlist")
      const wishData = await wishRes.json()
      setWishlistCount(wishData.length)
    }

    load()
  }, [])

  // Choose which count to show
  const count = isCartPage ? wishlistCount : cartCount

  return (
    <div className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">

        <Link href="/dashboard" className="text-xl font-bold">
          Make-It
        </Link>

        <div className="flex gap-6 items-center">

          <Link href="/products">Products</Link>

          {/* Dynamic Link */}
          <Link href={Href} className="relative flex items-center gap-1">
            <Icon className="w-5 h-5" />
            {Label}

            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-black text-white text-xs px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </Link>

        </div>

      </div>
    </div>
  )
}
