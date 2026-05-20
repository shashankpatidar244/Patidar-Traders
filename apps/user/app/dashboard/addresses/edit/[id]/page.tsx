"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function EditAddressPage() {
  const params = useParams()
  const router = useRouter()

  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  })

  useEffect(() => {
    if (!id) return

    async function loadAddress() {
      try {
        const res = await fetch(`/api/address/${id}`)
        const data = await res.json()

        if (!res.ok) {
          alert(data.error || "Address not found")
          router.push("/dashboard/addresses")
          return
        }

        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
          line1: data.line1 || "",
          line2: data.line2 || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        })

        setLoading(false)
      } catch {
        router.push("/dashboard/addresses")
      }
    }

    loadAddress()
  }, [id, router])

  async function handleUpdate() {
    const res = await fetch(`/api/address/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      alert("Update failed")
      return
    }

    router.push("/dashboard/addresses")
  }

  if (loading) {
    return <div className="p-10 text-center">Loading address...</div>
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">Edit Address</h1>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          value={(form as any)[key]}
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
      ))}

      <button
        onClick={handleUpdate}
        className="w-full py-3 bg-black text-white rounded"
      >
        Update Address
      </button>
    </div>
  )
}