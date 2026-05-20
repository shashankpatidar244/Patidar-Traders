import UserTimeline from "../components/UserTimeline"
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    

    const res = await fetch(
      `http://localhost:3001/api/user/${id}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return <div className="p-6 text-red-500">User not found</div>
    }

    const user = await res.json()

    const orders = user.orders || []
    const addresses = user.addresses || []
    const cart = user.cartItem || []
    const wishlist = user.wishlistItems || []

    const totalSpend = orders.reduce(
      (a: number, o: any) => a + (o.total || 0),
      0
    )

    const lastOrder = orders[0]

    return (
      <div className="p-6 space-y-6">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {user.username || "Unnamed User"}
            </h1>
            <p className="text-gray-500 text-sm">{user.phone}</p>
          </div>

          <div className="flex gap-2">
            <span className="px-3 py-1 text-sm rounded bg-purple-100 text-purple-600">
              {user.role}
            </span>

            <span
              className={`px-3 py-1 text-sm rounded ${
                user.isBlocked
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {user.isBlocked ? "Blocked" : "Active"}
            </span>
          </div>
        </div>

        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-xl font-bold">{orders.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">Total Spend</p>
            <p className="text-xl font-bold">₹{totalSpend}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">Addresses</p>
            <p className="text-xl font-bold">{addresses.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">Last Order</p>
            <p className="text-sm">
              {lastOrder
                ? new Date(lastOrder.createdAt).toLocaleDateString()
                : "No orders"}
            </p>
          </div>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* ORDERS */}
            <div className="bg-white p-5 rounded-2xl shadow">
              <h2 className="font-semibold mb-4">Recent Orders</h2>

              {orders.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No orders found
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((o: any) => (
                    <div
                      key={o.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">#{o.id}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p>₹{o.total}</p>
                        <p className="text-xs text-gray-500">
                          {o.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ADDRESSES */}
            <div className="bg-white p-5 rounded-2xl shadow">
              <h2 className="font-semibold mb-4">Addresses</h2>

              {addresses.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No addresses
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {addresses.map((a: any) => (
                    <div
                      key={a.id}
                      className="border p-3 rounded-lg text-sm"
                    >
                      <p className="font-medium">{a.fullName}</p>
                      <p>{a.line1}</p>
                      <p>
                        {a.city}, {a.state}
                      </p>
                      <p>{a.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* CART */}
            <div className="bg-white p-5 rounded-2xl shadow">
              <h2 className="font-semibold mb-4">Cart</h2>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Empty cart
                </p>
              ) : (
                cart.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex justify-between text-sm border-b py-2"
                  >
                    <span>Product #{c.productId}</span>
                    <span>Qty: {c.quantity}</span>
                  </div>
                ))
              )}
            </div>

            {/* WISHLIST */}
            <div className="bg-white p-5 rounded-2xl shadow">
              <h2 className="font-semibold mb-4">Wishlist</h2>

              {wishlist.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No items
                </p>
              ) : (
                wishlist.map((w: any) => (
                  <div
                    key={w.id}
                    className="text-sm border-b py-2"
                  >
                    Product #{w.productId}
                  </div>
                ))
              )}
            </div>

            {/* USER META */}
            <div className="bg-white p-5 rounded-2xl shadow">
              <h2 className="font-semibold mb-3">User Info</h2>

              <div className="text-sm space-y-2">
                <p>
                  Joined:{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>

                <p>User ID: {user.id}</p>
              </div>
            </div>

          </div>
        </div>
        <UserTimeline userId={Number(id)} />
      </div>

    )
  } catch (err) {
    console.error(err)

    return (
      <div className="p-6 text-red-500">
        Something went wrong 🚨
      </div>
    )
  }
}