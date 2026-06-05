"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

interface Props {
  products: any[];
}

export default function ProductGrid({ products }: Props) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    async function loadWishlist() {
      try {
        const res = await fetch("/api/wishlist");

        if (!res.ok) return;

        const data = await res.json();

        const ids = data.map(
          (item: any) => `${item.productId}-${item.variantId}`
        );

        setWishlist(ids);
      } catch (err) {
        console.error(err);
      }
    }

    loadWishlist();
  }, []);

  if (!products?.length) {
    return <p>No products available</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          wishlist={wishlist}
          setWishlist={setWishlist}
        />
      ))}
    </div>
  );
}
