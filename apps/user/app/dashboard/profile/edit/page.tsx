"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EditProfilePage() {
  const router = useRouter()
  const [name, setName] = useState("")

  async function handleUpdate() {
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    if (res.ok) {
      router.push("/dashboard/profile")
    } else {
      alert("Update failed")
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Update Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <input
          type="text"
          placeholder="Enter new name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}