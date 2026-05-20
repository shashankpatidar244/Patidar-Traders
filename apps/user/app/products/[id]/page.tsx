import { prisma } from "@repo/database";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "../../dashboard/components/AddToCartButton";
import ProductPurchase from "./ProductPurchase";

export default async function ProductPage({ params }: any) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) return notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      category: true,
      variants: true,
    },
  });

  if (!product) return notFound();

  return (
    <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-2 gap-10">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
        {product.images?.[0] && (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Info */}
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="text-gray-500 mt-2">{product.category?.name}</p>

        {/* Variant */}
        
        <ProductPurchase product={product} />
        </div>
      </div>
  );
}