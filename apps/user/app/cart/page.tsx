import { prisma } from "@repo/database"
import { getUserFromRequest } from "../lib/getUserFromRequest"
import { redirect } from "next/navigation"
import Link from "next/link"
import CartPageClient from "./CartPageClient"
import Navbar from "./components/Navbar"

export default async function CartPage() {

  const user = await getUserFromRequest()
  if (!user) redirect("/signin")

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { images: true }
      },
      variant: true
    }
  })

  if (!cartItems.length) {

    return (
      <div className="p-10 text-center">
        
        <Navbar />

        <h1 className="text-3xl font-bold mb-6">
          Your Cart is Empty
        </h1>

        <Link
          href="/products"
          className="px-6 py-3 bg-black text-white rounded"
        >
          Continue Shopping
        </Link>

      </div>
    )
  }

  return<>
  <Navbar />
  <CartPageClient cartItems={cartItems} />
  </> 
  
}