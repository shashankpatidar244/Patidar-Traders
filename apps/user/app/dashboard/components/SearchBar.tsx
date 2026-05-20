"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const existingCategory = searchParams.get("category")
  const existingSearch = searchParams.get("search") || ""

  const [search, setSearch] = useState(existingSearch)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (existingCategory) params.set("category", existingCategory)

    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-4"
    >
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-black"
      />

      <button
        type="submit"
        className="px-6 py-2 bg-black text-white rounded-full"
      >
        Search
      </button>
    </form>
  )
}