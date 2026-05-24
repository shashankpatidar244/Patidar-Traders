"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function useInventory() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const currentLimit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "name_asc";

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchInventory();
    }, 300);

    return () => clearTimeout(timeout);
  }, [page, currentLimit, search, status, sort]);

  async function fetchInventory() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(currentLimit));

      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (sort) params.set("sort", sort);

      const res = await fetch(
        `/api/inventory?${params.toString()}`
      );

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