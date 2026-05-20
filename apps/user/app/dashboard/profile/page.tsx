import { prisma } from "@repo/database"
import { getUserFromRequest } from "../../../app/lib/getUserFromRequest"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const user = await getUserFromRequest()
  if (!user) redirect("/signin")

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium">{dbUser?.username}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium">{dbUser?.phone}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium">{dbUser?.role}</p>
        </div>
      </div>
    </div>
  )
}