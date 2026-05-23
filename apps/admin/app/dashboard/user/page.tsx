import UserTable from "./components/UserTable"
import UserFilters from "./components/UserFilters"
import Pagination from "../components/Pagination"
import ImportExport from "./components/ImportExport"

export default async function Page({ searchParams }: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}) {
  // ================= SAFE PARAMS =================
  const params = await searchParams;
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);
  const safeParams: Record<string, string> ={};

  for (const key in params || {}) {
    const value = params[key as keyof typeof params];
    if (
      value !== undefined &&
      value !== null
    ) {
      safeParams[key] = String(value);
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

  // PAGINATION DATA
  const totalPages =
    data.pagination?.totalPages;

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
      <Pagination
        title="Users"
        page={page}
        totalPages={totalPages}
        currentLimit={limit}
      />
    </div>
  )
}