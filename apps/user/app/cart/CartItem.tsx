"use client"

export default function CartItem({
  item,
  selected,
  onSelect,
}: any) {

  async function update(type: "inc" | "dec") {
    await fetch("/api/cart", {
      method: "PATCH",
      body: JSON.stringify({
        id: item.id,
        type,
      }),
    })

    location.reload()
  }

  async function remove() {
    await fetch("/api/cart", {
      method: "DELETE",
      body: JSON.stringify({ id: item.id }),
    })

    location.reload()
  }

  async function saveForLater() {
    await fetch("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({
        productId: item.productId,
        variantId: item.variantId,
      }),
    })

    await remove()
  }

  // ✅ Pricing logic
  const mrp = item.variant?.mrp
  const sellingPrice = item.variant?.sellingPrice

  const discount =
    mrp && sellingPrice && mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0

  const totalPrice = (sellingPrice || 0) * item.quantity

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded shadow">

      {/* SELECT */}
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onSelect(item, e.target.checked)}
      />

      {/* IMAGE */}
      <img
        src={item.product.images?.[0]?.url}
        className="w-20 h-20 object-cover rounded"
      />

      {/* PRODUCT */}
      <div className="flex-1 ml-4">
        <p className="font-semibold">
          {item.product.name}
        </p>

        <p className="text-sm text-gray-500">
          {item.variant?.value}
        </p>

        {/* 💰 Price UI */}
        <div className="flex items-center gap-2 mt-1">
          {sellingPrice && (
            <p className="font-semibold text-gray-900">
              ₹{sellingPrice}
            </p>
          )}

          {mrp && sellingPrice && mrp > sellingPrice && (
            <p className="text-xs text-gray-400 line-through">
              ₹{mrp}
            </p>
          )}

          {discount > 0 && (
            <span className="text-xs text-green-600 font-medium">
              {discount}% OFF
            </span>
          )}
        </div>
      </div>

      {/* QUANTITY */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => update("dec")}
          className="px-2 border rounded"
        >
          -
        </button>

        <span>{item.quantity}</span>

        <button
          onClick={() => update("inc")}
          className="px-2 border rounded"
        >
          +
        </button>
      </div>

      {/* TOTAL PRICE */}
      <div className="w-24 text-right font-semibold">
        ₹{totalPrice}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 ml-4">
        <button
          onClick={saveForLater}
          className="text-blue-600 text-sm"
        >
          Save for later
        </button>

        <button
          onClick={remove}
          className="text-red-500 text-sm"
        >
          Remove
        </button>
      </div>

    </div>
  )
}