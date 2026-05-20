"use client"

import { useState } from "react"

// ✅ TYPE
type CSVUser = {
  username?: string
  phone: string
  role: "ADMIN" | "USER"
}

export default function ImportExport() {
  const [loading, setLoading] = useState(false)

  // ================= DOWNLOAD SAMPLE FILE =================
  const downloadSample = () => {
    const csv = [
      ["Name", "Phone", "Role"],
      ["Abc", "9999999999", "ADMIN"],
      ["Ram", "8888888888", "USER"],
    ]

    const blob = new Blob(
      [csv.map((row) => row.join(",")).join("\n")],
      { type: "text/csv" }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "users-sample.csv"
    a.click()
  }

  // ================= IMPORT CSV =================
  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()

    const rows = text.split("\n").slice(1)

    const parsedUsers: CSVUser[] = rows
      .map((row: string) => row.split(","))
      .filter((r: string[]) => r.length >= 2 && r[1])
      .map((r: string[]) => ({
        username: r[0]?.trim() || "",
        phone: r[1]!.trim(),
        role:
          r[2]?.trim() === "ADMIN" ? "ADMIN" : "USER",
      }))

    try {
      setLoading(true)

      const res = await fetch("/api/user/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: parsedUsers }),
      })

      if (!res.ok) throw new Error("Import failed")

      window.location.reload()
    } catch (err) {
      alert("Import failed ❌")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">

      {/* DOWNLOAD SAMPLE */}
      <button
        onClick={downloadSample}
        className="px-3 py-2 text-sm rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
      >
        Download Sample
      </button>

      {/* IMPORT */}
      <label className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 cursor-pointer">
        {loading ? "Importing..." : "Import CSV"}

        <input
          type="file"
          accept=".csv"
          hidden
          onChange={handleFile}
        />
      </label>

    </div>
  )
}