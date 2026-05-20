import { prisma } from "@repo/database"
import { getUserFromRequest } from "../lib/getUserFromRequest"
import { redirect } from "next/navigation"
import WishlistItem from "./WishlistItem"
import Navbar from "@/cart/components/Navbar"

export default async function WishlistPage() {

    const user = await getUserFromRequest()
    if (!user) redirect("/signin")

    const items = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: {
            product: { include: { images: true } },
            variant: true
        }
    })

    return (

        <div className="max-w-5xl mx-auto p-8 space-y-6">
            <Navbar />
            <h1 className="text-3xl font-bold">
                Your Wishlist
            </h1>

            {items.map((item) => (
                <WishlistItem key={item.id} item={item} />
            ))}

        </div>

    )

}