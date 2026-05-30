import { User2, Phone, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderCustomer({ user }: any) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500">
            CUSTOMER DETAILS
          </h2>

          {user?.id && (
            <button
            onClick={() => router.push(`/dashboard/user/${user.id}`)}
            className="
              flex items-center gap-1.5
              px-3 py-1.5
              text-xs font-medium
              rounded-lg
              bg-blue-600
              text-white
              hover:bg-blue-700
              transition
            "
          >
            <ExternalLink size={14} />
            View User
          </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 space-y-4">
        {/* USER */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <User2 size={20} />
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Customer Name</p>

            <p className="font-semibold text-gray-900">
              {user?.username || "Guest User"}
            </p>
          </div>
        </div>

        {/* PHONE */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            <Phone size={18} />
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Phone Number</p>

            <p className="font-medium text-gray-800">{user?.phone || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
