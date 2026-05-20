import { prisma } from "@repo/database"
import ProductForm from "./ProductForm"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ unwrap params
  const resolvedParams = await params

  const id = Number(resolvedParams.id)

  if (!id) {
    return <div>Invalid Product ID</div>
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: true,
    },
  })

  if (!product) {
    return <div>Product not found</div>
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <ProductForm product={product} />
    </div>
  )
}