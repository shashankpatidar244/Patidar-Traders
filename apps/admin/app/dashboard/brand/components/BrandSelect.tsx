"use client"

import { useEffect, useState } from "react"

interface Brand {
  id: number
  name: string
}

interface Props {
  value?: number
  onChange: (id: number) => void
  placeholder?: string
}

export default function BrandSelect({
  value,
  onChange,
  placeholder = "Select Brand",
}: Props) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true)
      const res = await fetch("/api/brand?limit=100")
      const data = await res.json()
      setBrands(data.data || [])
      setLoading(false)
    }

    fetchBrands()
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

        {brands.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}