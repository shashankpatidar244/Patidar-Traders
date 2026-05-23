"use client"

import { useEffect, useState } from "react"

export function usePayments(query: string, page: number, limit: number) {
  const [data, setData] = useState<any[]>([])
  const [meta, setMeta] = useState<any>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)

  const fetchPayments = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        query,
        page: String(page),
        limit: String(limit),
      })
      const res = await fetch(`/api/payment?${params.toString()}`)
      const json = await res.json()
      setData(json.data)
      setMeta(
        json.meta || {  total: 0,page: 1,limit,totalPages: 1,}
      )
    } catch (err) {
      console.error(
        "PAYMENTS FETCH ERROR:",
        err
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()

    // AUTO REFRESH EVERY 5s
    const interval = setInterval(() => {
      fetchPayments()
    }, 60000)

    return () => clearInterval(interval)
  },  [query, page, limit])

  return {
    data,
    meta,
    loading,
    refetch: fetchPayments,
  }
}