"use client";

import useSWR from "swr";

import { useSearchParams } from "next/navigation";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  return res.json();
};

/* ================= TYPES ================= */

export type Variant = {
  id: number;
  name: string;
  value: string;
  unit?: string;
  mrp?: number | null;
  sellingPrice?: number | null;
  stock: number;
};

export type Product = {
  id: number;
  name: string;
  description?: string;
  technicalName?: string;
  isActive: boolean;
  createdAt: string;

  images: {
    id: number;
    url: string;
  }[];

  variants: Variant[];

  category?: {
    name: string;
  };

  brand?: {
    name: string;
  };
};

type UseProductsReturn = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
};

/* ================= HOOK ================= */

export function useProducts(): UseProductsReturn {
  const searchParams = useSearchParams();

  const query = searchParams.toString();

  const url = query ? `/api/products?${query}` : `/api/products`;

  const { data, error, mutate, isLoading } = useSWR<{
    data: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>(
    url,
    fetcher
  );

  return {
    products: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 1,
    isLoading,
    isError: !!error,
    mutate,
  };
}
