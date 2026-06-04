import { prisma } from "@repo/database"
import { getUserFromRequest } from "../../../app/lib/getUserFromRequest"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const user = await getUserFromRequest()
  if (!user) redirect("/signin")

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      orders: true,
      addresses: true,
      wishlistItems: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Profile Hero */}
      <div className="bg-gradient-to-br from-black to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-5 py-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
              {dbUser?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
  
            <div>
              <h1 className="text-2xl font-bold">
                {dbUser?.username || "User"}
              </h1>
  
              <p className="text-white/80 mt-1">
                +91 {dbUser?.phone}
              </p>
  
              <div className="mt-3">
                {dbUser?.isVerified ? (
                  <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-200 border border-green-400/30">
                    ✓ Verified Account
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-200 border border-yellow-400/30">
                    Verification Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-sm border text-center">
            <h3 className="text-2xl font-bold">
              {dbUser?.orders.length || 0}
            </h3>
  
            <p className="text-xs text-gray-500 mt-1">
              Orders
            </p>
          </div>
  
          <div className="bg-white rounded-3xl p-4 shadow-sm border text-center">
            <h3 className="text-2xl font-bold">
              {dbUser?.wishlistItems.length || 0}
            </h3>
  
            <p className="text-xs text-gray-500 mt-1">
              Wishlist
            </p>
          </div>
  
          <div className="bg-white rounded-3xl p-4 shadow-sm border text-center">
            <h3 className="text-2xl font-bold">
              {dbUser?.addresses.length || 0}
            </h3>
  
            <p className="text-xs text-gray-500 mt-1">
              Addresses
            </p>
          </div>
        </div>
  
        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-semibold">
              Quick Actions
            </h2>
          </div>
  
          <div className="grid grid-cols-2">
            <a
              href="/dashboard/orders"
              className="p-5 border-r border-b hover:bg-gray-50"
            >
              <div className="text-2xl">📦</div>
  
              <p className="font-medium mt-2">
                My Orders
              </p>
  
              <p className="text-xs text-gray-500">
                Track your orders
              </p>
            </a>
  
            <a
              href="/dashboard/wishlist"
              className="p-5 border-b hover:bg-gray-50"
            >
              <div className="text-2xl">❤️</div>
  
              <p className="font-medium mt-2">
                Wishlist
              </p>
  
              <p className="text-xs text-gray-500">
                Saved products
              </p>
            </a>
  
            <a
              href="/dashboard/addresses"
              className="p-5 border-r hover:bg-gray-50"
            >
              <div className="text-2xl">📍</div>
  
              <p className="font-medium mt-2">
                Addresses
              </p>
  
              <p className="text-xs text-gray-500">
                Delivery locations
              </p>
            </a>
  
            <a
              href="/dashboard/support"
              className="p-5 hover:bg-gray-50"
            >
              <div className="text-2xl">🎧</div>
  
              <p className="font-medium mt-2">
                Support
              </p>
  
              <p className="text-xs text-gray-500">
                Get help
              </p>
            </a>
          </div>
        </div>
  
        {/* Account Information */}
        <div className="mt-6 bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-semibold">
              Account Information
            </h2>
          </div>
  
          <div className="divide-y">
            <div className="flex justify-between p-5">
              <span className="text-gray-500">
                Full Name
              </span>
  
              <span className="font-medium">
                {dbUser?.username || "-"}
              </span>
            </div>
  
            <div className="flex justify-between p-5">
              <span className="text-gray-500">
                Phone
              </span>
  
              <span className="font-medium">
                {dbUser?.phone}
              </span>
            </div>
  
            <div className="flex justify-between p-5">
              <span className="text-gray-500">
                Role
              </span>
  
              <span className="font-medium">
                {dbUser?.role}
              </span>
            </div>
  
            <div className="flex justify-between p-5">
              <span className="text-gray-500">
                Joined
              </span>
  
              <span className="font-medium">
                {new Date(
                  dbUser!.createdAt
                ).toLocaleDateString()}
              </span>
            </div>
  
            <div className="flex justify-between p-5">
              <span className="text-gray-500">
                Status
              </span>
  
              <span
                className={`font-medium ${
                  dbUser?.isBlocked
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {dbUser?.isBlocked
                  ? "Blocked"
                  : "Active"}
              </span>
            </div>
          </div>
        </div>
  
        {/* Logout */}
        <div className="mt-6">
          <button className="w-full h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 font-medium hover:bg-red-100 transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
  
}