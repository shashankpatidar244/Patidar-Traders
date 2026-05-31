import UserTable from "./components/UserTable";
import UserSearchFilters from "./components/UserSearchFilters";
import Pagination from "../../components/shared/Pagination";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    status?: string;
    sort?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  // ================= SAFE PARAMS =================
  const params = await searchParams;

  const page = Number(params.page || 1);

  const limit = Number(params.limit || 10);

  const safeParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) {
      safeParams.set(key, String(value));
    }
  });

  const query = safeParams.toString();

  // ================= BASE URL =================
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // ================= FETCH =================
  let data;

  try {
    const res = await fetch(`${baseUrl}/api/user?${query}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch users");

    data = await res.json();
  } catch (err) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load users ❌
      </div>
    );
  }

  const users = data.data || [];

  const totalPages = data.totalPages || 1;

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
      <UserSearchFilters />

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
  );
}
