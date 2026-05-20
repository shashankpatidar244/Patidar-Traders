"use client";

import { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetch("/api/products/category")
      .then((res) => res.json())
      .then(setCategories);

    fetch("/api/products/brand")
      .then((res) => res.json())
      .then(setBrands);
  }, []);

  return (
    <div className="p-6">
      <ProductForm
        categories={categories}
        brands={brands}
      />
    </div>
  );
}