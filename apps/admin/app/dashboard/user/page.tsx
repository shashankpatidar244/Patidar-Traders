import UserTable from "./components/UserTable"
import UserFilters from "./components/UserFilters"
import Pagination from "./components/Pagination"
import ImportExport from "./components/ImportExport"

export default async function Page({ searchParams }: any) {
  // ================= SAFE PARAMS =================
  const safeParams: Record<string, string> = {}

  for (const key in searchParams || {}) {
    const value = searchParams[key]
    if (value !== undefined && value !== null) {
      safeParams[key] = String(value)
    }
  }

  const query = new URLSearchParams(safeParams).toString()

  // ================= BASE URL =================
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  // ================= FETCH =================
  let data

  try {
    const res = await fetch(`${baseUrl}/api/user?${query}`, {
      cache: "no-store",
    })

    if (!res.ok) throw new Error("Failed")

    data = await res.json()
  } catch (err) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load users ❌
      </div>
    )
  }

  const users = data.users || []

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-500">
            Manage users, roles and access
          </p>
        </div>
      </div>

      {/* FILTER + ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <UserFilters />
        <ImportExport/>
      </div>

      {/* TABLE */}
      <UserTable users={users} />

      {/* PAGINATION */}
      <Pagination total={data.total} />
    </div>
  )
}