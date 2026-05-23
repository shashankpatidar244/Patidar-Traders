"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

export function useInventory(filters: any) {
  const searchParams = useSearchParams();

  // GET FROM URL
  const page = Number(searchParams.get("page") || 1);

  const currentLimit = Number(searchParams.get("limit") || 10);

  const [data, setData] = useState([]);

  const [totalPages, setTotalPages] = useState(1);

  const [totalVariants, setTotalVariants] = useState(0);

  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(delay);
  }, [filters, page, currentLimit]);

  async function fetchData() {
    const params = new URLSearchParams({
      ...filters,

      page: String(page),

      limit: String(currentLimit),
    });

    const res = await fetch(`/api/inventory?${params}`);

    const json = await res.json();

    setData(json.data || []);

    setTotalPages(json.pages || 1);

    setTotalVariants(json.totalVariants || 0);

    setTotalProducts(json.totalProducts || 0);
  }

  return {
    data,
    page,
    totalPages,
    currentLimit,
    totalVariants,
    totalProducts,
    refresh: fetchData,
  };
}
