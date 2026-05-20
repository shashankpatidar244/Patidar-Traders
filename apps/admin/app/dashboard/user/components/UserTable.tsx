"use client"

import { useState } from "react"
import UserRow from "./UserRow"
import BulkActions from "./BulkActions"

export default function UserTable({
  users,
}: {
  users: any[]
}) {
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selected.length === users.length) {
      setSelected([])
    } else {
      setSelected(users.map((u) => u.id))
    }
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-gray-500">
        <p className="text-lg">No users found 😕</p>
        <p className="text-sm mt-1">Try adjusting filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* BULK ACTIONS */}
      <BulkActions selected={selected} users={users} />

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <table className="w-full text-sm">

          {/* HEADER */}
          <thead className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b">
            <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">

              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={selected.length === users.length}
                  className="cursor-pointer"
                />
              </th>

              <th className="p-4">User</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Spend</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                selected={selected.includes(user.id)}
                onSelect={toggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}