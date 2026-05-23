import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/options"

export async function GET() {
  // no req/res in App Router
  const session = await getServerSession(authOptions)

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Cast user to Prisma user type
  const user = session.user as { id: string; phone: string; role: string }

  return NextResponse.json({ user })
}