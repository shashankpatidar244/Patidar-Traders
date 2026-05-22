"use client";

import { useEffect, useState } from "react";

export function useInventory(filters: any) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);

  const [currentLimit, setCurrentLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

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

    setData(json.data);
    setTotalPages(json.pages);
  }

  function updateLimit(limit: number) {
    setCurrentLimit(limit);
    setPage(1);
  }

  return {
    data,
    page,
    setPage,
    totalPages,
    currentLimit,
    updateLimit,
    refresh: fetchData,
  };
}
