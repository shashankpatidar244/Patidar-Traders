"use client"
import { useRouter } from "next/navigation"

interface Category {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    products: number
  }
}

interface Props {
  data: Category[]
  onEdit: (c: Category) => void
  onDelete: (id: number) => void
}

export default function CategoryTable({ data, onEdit, onDelete }: Props) {
  const router = useRouter()
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto relative z-0">
      <table className="w-full min-w-[700px] text-sm">
        {/* Header */}
        <thead className="bg-gray-100 sticky top-0 z-0">
          <tr className="text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Products</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-gray-400">
                No categories found
              </td>
            </tr>
          ) : (
            data.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">{c.id}</td>

                <td className="p-3 font-medium capitalize">
                  {c.name}
                </td>

                <td className="p-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {c._count.products}
                  </span>
                </td>

                <td className="p-3">
                  {c._count.products > 0 ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
                      Empty
                    </span>
                  )}
                </td>

                <td className="p-3 text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="hover:bg-gray-200 p-1 rounded"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => onDelete(c.id)}
                    className="hover:bg-red-100 p-1 rounded"
                  >
                    🗑️  
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/dashboard/products?categoryId=${c.id}`)
                    }
                    className="hover:bg-blue-100 p-1 rounded"
                  >
                    🔍
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}