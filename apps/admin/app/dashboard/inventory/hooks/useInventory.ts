"use client"

import { useEffect, useState } from "react"

export function useInventory(filters: any) {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData()
    }, 400)

    return () => clearTimeout(delay)
  }, [filters, page])

  async function fetchData() {
    const params = new URLSearchParams({
      ...filters,
      page: String(page),
    })

    const res = await fetch(`/api/inventory?${params}`)
    const json = await res.json()

    setData(json.data)
    setTotalPages(json.pages)
  }

  return { data, page, setPage, totalPages, refresh: fetchData }
}