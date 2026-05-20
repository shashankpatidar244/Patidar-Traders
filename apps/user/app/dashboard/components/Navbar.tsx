"use client"

import Link from "next/link"
import LogoutButton from "./LogoutButton"
import CartIcon from "./CartIcon"
import ProfileDropdown from "./ProfileDropdown"

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight"
          >
            Website Name
          </Link>

          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-black transition"
          >
            Shop
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          
          <Link
            href="http://localhost:3001/login"
            className="text-sm text-gray-600 hover:text-black transition"
          >
            Admin
          </Link>

          {/* Cart Icon */}
          <CartIcon />

          {/* Profile */}
          <ProfileDropdown /> 

          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}