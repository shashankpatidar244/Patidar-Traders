"use client"

import { useEffect, useState } from "react"

export function usePayments(query: string, page: number) {
  const [data, setData] = useState<any[]>([])
  const [meta, setMeta] = useState<any>({})
  const [loading, setLoading] = useState(true)

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/payment?${query}&page=${page}&limit=10`)
      const json = await res.json()
      setData(json.data)
      setMeta(json.meta)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()

    // 🔥 AUTO REFRESH EVERY 5s
    const interval = setInterval(() => {
      fetchPayments()
    }, 5000)

    return () => clearInterval(interval)
  }, [query, page])

  return { data, meta, loading, refetch: fetchPayments }
}