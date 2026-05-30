import UserTimeline from "../components/UserTimeline";

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>

      <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;

    const res = await fetch(`http://localhost:3001/api/user/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return <div className="p-6 text-red-500">User not found</div>;
    }

    const user = await res.json();

    const orders = user.orders || [];
    const addresses = user.addresses || [];
    const cart = user.cartItem || [];
    const wishlist = user.wishlistItems || [];

    const totalSpend = orders.reduce(
      (acc: number, order: any) => acc + Number(order.total || 0),
      0
    );

    return (
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  {user.username || "Unnamed User"}
                </h1>

                <p className="text-white/80 mt-1">{user.phone}</p>

                <p className="text-white/70 text-sm mt-1">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur text-sm">
                {user.role}
              </span>

              <span
                className={`px-4 py-2 rounded-xl text-sm ${
                  user.isBlocked ? "bg-red-500/20" : "bg-green-500/20"
                }`}
              >
                {user.isBlocked ? "Blocked" : "Active"}
              </span>

              <span
                className={`px-4 py-2 rounded-xl text-sm ${
                  user.isVerified ? "bg-blue-500/20" : "bg-gray-500/20"
                }`}
              >
                {user.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard title="Orders" value={orders.length} />

          <StatCard title="Spend" value={`₹${totalSpend.toLocaleString()}`} />

          <StatCard title="Addresses" value={addresses.length} />

          <StatCard title="Cart" value={cart.length} />

          <StatCard title="Wishlist" value={wishlist.length} />

          <StatCard title="User ID" value={user.id} />
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* ORDERS */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h2 className="font-semibold text-lg mb-4">Recent Orders</h2>

              {orders.length === 0 ? (
                <p className="text-gray-400 text-sm">No orders found</p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 25).map((order: any) => (
                    <div key={order.id} className="border rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>

                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold">₹{Number(order.total)}</p>

                          <p className="text-xs text-gray-500">
                            {order.status}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={
                                item.product?.images?.[0]?.url ||
                                "/placeholder.png"
                              }
                              alt=""
                              className="w-10 h-10 rounded-lg border object-cover"
                            />

                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {item.product?.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {item.variant?.value}
                              </p>
                            </div>

                            <span className="text-sm">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ADDRESSES */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h2 className="font-semibold text-lg mb-4">Addresses</h2>

              {addresses.length === 0 ? (
                <p className="text-gray-400">No addresses</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {addresses.map((a: any) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{a.fullName}</h3>

                        {a.isDefault && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-1">{a.phone}</p>

                      <div className="mt-3 text-sm text-gray-700 space-y-1">
                        <p>{a.line1}</p>

                        {a.line2 && <p>{a.line2}</p>}

                        <p>
                          {a.city}, {a.state}
                        </p>

                        <p>{a.pincode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* CART */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h2 className="font-semibold text-lg mb-4">Cart Items</h2>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-sm">Empty cart</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-xl border hover:bg-gray-50 transition"
                    >
                      <img
                        src={
                          item.product?.images?.[0]?.url || "/placeholder.png"
                        }
                        alt=""
                        className="w-14 h-14 rounded-xl border object-cover"
                      />

                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product?.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.variant?.value}
                        </p>
                      </div>

                      {item.quantity && (
                        <div className="font-semibold text-sm">
                          x{item.quantity}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WISHLIST */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h2 className="font-semibold text-lg mb-4">Wishlist</h2>

              {wishlist.length === 0 ? (
                <p className="text-gray-400 text-sm">No wishlist items</p>
              ) : (
                <div className="space-y-3">
                  {wishlist.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={
                          item.product?.images?.[0]?.url || "/placeholder.png"
                        }
                        alt=""
                        className="w-12 h-12 rounded-lg border object-cover"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          {item.product?.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.variant?.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* USER INFO */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h2 className="font-semibold text-lg mb-4">User Information</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>

                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>

                  <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>

                  <span>{user.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UserTimeline userId={Number(id)} />
      </div>
    );
  } catch (err) {
    console.error(err);

    return <div className="p-6 text-red-500">Something went wrong 🚨</div>;
  }
}
