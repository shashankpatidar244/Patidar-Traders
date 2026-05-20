"use client"

export default function WishlistItem({ item }: any) {

    async function moveToCart() {

        await fetch("/api/cart", {
            method: "POST",
            body: JSON.stringify({
                productId: item.productId,
                variantId: item.variantId
            })
        })

        await fetch("/api/wishlist", {
            method: "DELETE",
            body: JSON.stringify({ id: item.id })
        })

        location.reload()

    }

    return (

        <div className="flex gap-4 border p-4 rounded bg-white">

            <img
                src={item.product.images?.[0]?.url}
                className="w-24 h-24 object-cover"
            />

            <div className="flex-1">

                <p className="font-semibold">
                    {item.product.name}
                </p>

                <p className="text-gray-500">
                    {item.variant.value}
                </p>

                <button
                    onClick={moveToCart}
                    className="mt-3 bg-black text-white px-4 py-2 rounded"
                >
                    Move to Cart
                </button>

            </div>

        </div>

    )

}