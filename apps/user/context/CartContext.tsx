"use client"

import { createContext, useState } from "react"

export const CartContext = createContext<any>(null)

export function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [cart, setCart] = useState<any[]>([])

  function addToCart(product: any) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart }}
    >
      {children}
    </CartContext.Provider>
  )
}