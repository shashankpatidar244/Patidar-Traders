"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function useInventory() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const currentLimit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";
  const stock = searchParams.get("stock") || "";
  const unit = searchParams.get("unit") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const sort = searchParams.get("sort") || "newest";

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchInventory();
    }, 300);

    return () => clearTimeout(timeout);
  }, [page, currentLimit, search, stock, unit, category, brand, sort]);

  async function fetchInventory() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(currentLimit));

      if (search) params.set("search", search);
      if (stock) params.set("stock", stock);

      if (unit) params.set("unit", unit);

      if (category) params.set("category", category);

      if (brand) params.set("brand", brand);

      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/inventory?${params.toString()}`);

      const json = await res.json();

      setData(json.data || []);
      setTotalPages(json.totalPages || 1);
      setTotalProducts(json.totalProducts || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    page,
    totalPages,
    currentLimit,
    totalProducts,
    loading,
    refresh: fetchInventory,
  };
}
