import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useCategories() {
  const { data, isLoading } = useSWR("/api/category", fetcher)

  return {
    categories: data?.data || [],
    isLoading,
  }
}