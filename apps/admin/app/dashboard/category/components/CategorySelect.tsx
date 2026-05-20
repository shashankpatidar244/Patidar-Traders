"use client"

import { useEffect, useState } from "react"

interface Category {
  id: number
  name: string
}

interface Props {
  value?: number
  onChange: (id: number) => void
  placeholder?: string
}

export default function CategorySelect({
  value,
  onChange,
  placeholder = "Select Category",
}: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      const res = await fetch("/api/category?limit=100")
      const data = await res.json()
      setCategories(data.data || [])
      setLoading(false)
    }

    fetchCategories()
  }, [])

  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border w-full p-2 rounded"
      >
        <option value="">
          {loading ? "Loading..." : placeholder}
        </option>

        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}