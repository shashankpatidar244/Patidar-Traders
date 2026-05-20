import ProductCard from "./ProductCard"

interface Props {
  products: any[]
}

export default function ProductGrid({ products }: Props) {

  if (!products?.length) {
    return <p>No products available</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}

    </div>
  )
}