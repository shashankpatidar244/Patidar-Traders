"use client";

import UserActions from "./UserActions";
import { useRouter } from "next/navigation";

type UserType = {
  id: number;
  username?: string;
  phone: string;
  role: "ADMIN" | "USER";
  isBlocked: boolean;
  totalOrders: number;
  totalSpend: number;
  createdAt: string;
};

export default function UserRow({
  user,
  selected,
  onSelect,
}: {
  user: UserType;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const router = useRouter();
  const date = new Date(user.createdAt);

  const goToUser = () => {
    router.push(`/dashboard/user/${user.id}`);
  };

  function formatCurrency(amount: number): string {
    if (!amount) return "₹0";

    if (amount >= 1_00_00_00_00_000)
      return "₹" + (amount / 1_00_00_00_00_000).toFixed(1) + "T";
    if (amount >= 1_00_00_00_000)
      return "₹" + (amount / 1_00_00_00_000).toFixed(1) + "B";
    if (amount >= 1_00_00_000)
      return "₹" + (amount / 1_00_00_000).toFixed(1) + "Cr";
    if (amount >= 1_00_000) return "₹" + (amount / 1_00_000).toFixed(1) + "L";

    return "₹" + amount;
  }

  return (
    <tr
      onClick={goToUser}
      className="hover:bg-gray-50/70 transition border-t cursor-pointer"
    >
      {/* CHECKBOX */}
      <td
        className="p-4"
        onClick={(e) => e.stopPropagation()} // prevent row click
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user.id)}
          className="cursor-pointer accent-black"
        />
      </td>

      {/* USER */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
            {user.username?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">
              {user.username || "No Name"}
            </span>
            <span className="text-xs text-gray-400">ID: #{user.id}</span>
          </div>
        </div>
      </td>

      {/* PHONE */}
      <td className="p-4 text-gray-600">{user.phone}</td>

      {/* ROLE */}
      <td className="p-4">
        <span
          className={`flex items-center gap-1 w-fit px-2.5 py-1 text-xs font-medium rounded-full ${
            user.role === "ADMIN"
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {user.role === "ADMIN"}
          {user.role}
        </span>
      </td>

      {/* STATUS */}
      <td className="p-4">
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            user.isBlocked
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      </td>

      {/* ORDERS */}
      <td className="p-4 text-gray-700 font-medium">{user.totalOrders}</td>

      {/* SPEND */}
      <td
        className="p-4 font-semibold text-gray-900 whitespace-nowrap"
        title={`₹${user.totalSpend.toLocaleString("en-IN")}`} // full value on hover
      >
        {formatCurrency(user.totalSpend)}
      </td>

      {/* DATE */}
      <td
        className="p-2 text-[11px] text-gray-500"
        title={date.toLocaleString()}
      >
        <div className="flex flex-col leading-tight">
          <span className="font-medium text-gray-700">
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>

          <span className="text-[10px] text-gray-400">
            {date
              .toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .replace(":", " : ")}
          </span>
        </div>
      </td>

      {/* ACTIONS */}
      <td
        className="p-4 text-right"
        onClick={(e) => e.stopPropagation()} // prevent navigation
      >
        <UserActions user={user} />
      </td>
    </tr>
  );
}
