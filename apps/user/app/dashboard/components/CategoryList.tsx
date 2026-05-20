"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface Props {
  categories: any[]
}

export default function CategoryList({ categories }: Props) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category")

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-wide">
        Categories
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">

        {/* All Button */}
        <Link
          href="/dashboard"
          className={`px-5 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium
            ${
              !activeCategory
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
        >
          All
        </Link>

        {/* Category Buttons */}
        {categories.map((cat) => {
          const isActive = activeCategory === String(cat.id)

          return (
            <Link
              key={cat.id}
              href={`/dashboard?category=${cat.id}`}
              className={`px-5 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium
                ${
                  isActive
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {cat.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}