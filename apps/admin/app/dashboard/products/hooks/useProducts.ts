"use client"

import useSWR from "swr"
import { useSearchParams } from "next/navigation"

const fetcher = (url: string) => fetch(url).then(res => res.json())

/* ================= TYPES ================= */

export type Variant = {
  id: number
  name: string
  value: string
  unit?: string
  mrp?: number | null
  sellingPrice?: number | null
  stock: number
}

export type Product = {
  id: number
  name: string
  description?: string
  technicalName?: string
  isActive: boolean
  createdAt: string

  images: { id: number; url: string }[]
  variants: Variant[]

  category?: { name: string }
  brand?: { name: string }
}

/* ✅ ADD THIS TYPE */
type UseProductsReturn = {
  products: Product[]
  isLoading: boolean
  isError: boolean
  mutate: () => void
}

/* ================= HOOK ================= */

export function useProducts(): UseProductsReturn {
  const searchParams = useSearchParams()

  const query = searchParams.toString()
  const url = query ? `/api/products?${query}` : `/api/products`

  const { data, error, mutate, isLoading } = useSWR<Product[]>(
    url,
    fetcher
  )

  return {
    products: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}