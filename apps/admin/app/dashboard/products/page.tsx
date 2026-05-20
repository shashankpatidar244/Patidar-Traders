import { prisma } from "@repo/database"
import ProductTable from "./components/ProductTable"
import ProductFilters from "./components/ProductFilters"
import Link from "next/link"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: any
}) {

  const params = await searchParams

  const {
    search,
    category,
    status,
    sort,
    page = 1,
    limit = 10,
  } = params

  // 🔍 WHERE FILTER
  const where: any = {}

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    }
  }

  if (category) {
    where.categoryId = Number(category)
  }

  if (status) {
    where.isActive = status === "active"
  }

  // ✅ SORT (DB-safe)
  let orderBy: any = { createdAt: "desc" }

  if (sort === "newest") {
    orderBy = { createdAt: "desc" }
  }

  // 📦 FETCH
  let products = await prisma.product.findMany({
    where,
    include: {
      images: true,
      variants: true,
      category: true,
    },
    orderBy,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  })

  // 🔥 FIX: SORT BY SELLING PRICE
  const getMinPrice = (variants: any[]) => {
    if (!variants?.length) return 0
    return Math.min(
      ...variants.map((v) => v.sellingPrice ?? 0)
    )
  }

  if (sort === "price_low") {
    products = products.sort((a: any, b: any) => {
      return getMinPrice(a.variants) - getMinPrice(b.variants)
    })
  }

  if (sort === "price_high") {
    products = products.sort((a: any, b: any) => {
      return getMinPrice(b.variants) - getMinPrice(a.variants)
    })
  }

  // 📊 COUNT
  const totalProducts = await prisma.product.count({ where })
  const totalPages = Math.ceil(totalProducts / Number(limit))

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <Link
          href="/dashboard/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          + Add Product
        </Link>
      </div>

      {/* FILTERS */}
      <ProductFilters />

      {/* TABLE */}
      <ProductTable/>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">

        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">

          {/* PREV */}
          <a
            href={`/dashboard/products?page=${Number(page) - 1}&limit=${limit}`}
            className={`px-3 py-1 border rounded ${
              Number(page) <= 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Prev
          </a>

          {/* NEXT */}
          <a
            href={`/dashboard/products?page=${Number(page) + 1}&limit=${limit}`}
            className={`px-3 py-1 border rounded ${
              Number(page) >= totalPages
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            Next
          </a>

        </div>
      </div>
    </div>
  )
}