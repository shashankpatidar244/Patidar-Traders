"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "./LogoutButton"

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () =>
      document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-gray-600 hover:text-black transition"
      >
        Profile
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white border rounded-xl shadow-lg py-2 z-50">
          <Link
            href="/dashboard/profile"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            My Profile
          </Link>

          <Link
            href="/dashboard/profile/edit"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            Update Profile
          </Link>

          <Link
            href="/dashboard/profile/change-password"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
            Change Password
          </Link>

          <Link
            href="/dashboard/orders"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            My Orders
          </Link>

          <Link
            href="/cart"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            My Cart
          </Link>

          <Link
            href="/wishlist"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            My Wishlist
          </Link>


          <Link
            href="/dashboard/addresses"
            className="block px-4 py-2 hover:bg-gray-100"
          >       
             My Addresses
          </Link>

          <div className="border-t my-2" />

          <div className="px-4 py-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}