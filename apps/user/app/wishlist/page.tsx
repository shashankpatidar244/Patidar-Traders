import { prisma } from "@repo/database";
import { getUserFromRequest } from "../lib/getUserFromRequest";
import { redirect } from "next/navigation";
import WishlistItem from "./WishlistItem";
import Navbar from "@/cart/components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function WishlistPage() {
  const user = await getUserFromRequest();
  if (!user) redirect("/signin");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: { include: { images: true } },
      variant: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <Navbar />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="
    group h-11 w-11 rounded-2xl border border-slate-200 bg-white
    shadow-sm flex items-center justify-center
    hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md
    transition-all duration-300
  "
          >
            <ArrowLeft
              size={20}
              className="text-slate-700 group-hover:text-indigo-600"
            />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Wishlist</h1>
          </div>
        </div>

        <Link
          href="/products"
          className="
      inline-flex
      items-center
      justify-center
      gap-2

      px-5
      py-3

      rounded-2xl

      bg-gradient-to-r
      from-orange-500
      to-orange-600

      text-white
      font-semibold

      shadow-lg
      shadow-orange-200/50

      hover:scale-[1.02]
      hover:shadow-xl

      transition-all
      duration-300
    "
        >
          <span className="text-lg">+</span>
          Add More Items
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <WishlistItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
