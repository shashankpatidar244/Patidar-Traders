"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HeartIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const pathname = usePathname();

  const isCartPage = pathname === "/cart";
  const isWishlistPage = pathname === "/wishlist";

  const Label = isCartPage ? "Wishlist" : "Cart";
  const Href = isCartPage ? "/wishlist" : "/cart";

  const Icon = isCartPage ? HeartIcon : ShoppingCartIcon;

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const cartRes = await fetch("/api/cart");
        const cartData = await cartRes.json();
        setCartCount(cartData.length);

        const wishRes = await fetch("/api/wishlist");
        const wishData = await wishRes.json();
        setWishlistCount(wishData.length);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  const count = isCartPage ? wishlistCount : cartCount;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="
              text-2xl
              font-extrabold
              tracking-tight
              text-slate-900
              hover:text-orange-500
              transition
            "
          >
            Make-It
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className={`
                flex items-center gap-2
                px-4 py-2
                rounded-xl
                font-medium
                transition-all
                ${
                  pathname === "/products"
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <Squares2X2Icon className="w-5 h-5" />
              <span className="hidden sm:block">Products</span>
            </Link>

            <Link
              href={Href}
              className="
                relative
                flex items-center gap-2

                px-4 py-2
                rounded-xl

                bg-orange-500
                text-white

                shadow-sm
                hover:bg-orange-600

                transition-all
              "
            >
              <Icon className="w-5 h-5" />

              <span>{Label}</span>

              {count > 0 && (
                <span
                  className="
                    absolute
                    -top-2
                    -right-2

                    min-w-[20px]
                    h-5

                    flex
                    items-center
                    justify-center

                    rounded-full

                    bg-white
                    text-orange-600

                    text-[11px]
                    font-bold

                    border
                    border-orange-200
                  "
                >
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
