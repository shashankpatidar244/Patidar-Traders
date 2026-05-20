"use client"
import useSWR from "swr"

export function useDashboard(range: number) {
  const { data, error, isLoading } = useSWR(
    `/api/dashboard?range=${range}`,
    url => fetch(url).then(r => r.json()),
    { refreshInterval: 10000 }
  )

  return { data, isLoading, isError: error }
}