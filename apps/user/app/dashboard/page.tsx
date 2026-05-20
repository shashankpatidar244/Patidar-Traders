import { prisma } from "@repo/database"
import { getUserFromRequest } from "../lib/getUserFromRequest"
import { redirect } from "next/navigation"
import CategoryList from "./components/CategoryList"
import SearchBar from "./components/SearchBar"
import ProductGrid from "./components/ProductGrid";

interface Props {
  searchParams: Promise<{
    category?: string
    search?: string
  }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const user = await getUserFromRequest()
  if (!user) redirect("/signin")
  const params = await searchParams

  const categoryId = params.category
    ? Number(params.category)
    : undefined

  const search = params.search || ""

  const categories = await prisma.category.findMany()

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    },
    include: {
      images: true,
      category: true,
      variants: true
    },
  })

  return (
    <div className="space-y-10">
      <SearchBar />
      <CategoryList categories={categories} />
      <h1 className="text-2xl font-bold mb-6">
        Products
      </h1>
      <ProductGrid products={products} />
    </div>
  )
}