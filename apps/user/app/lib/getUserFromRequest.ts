import { cookies } from "next/headers"
import { verifyAccessToken } from "./jwt"
import { prisma } from "@repo/database"

export async function getUserFromRequest() {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value

  if (!token) return null

  try {
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    })

    return user
  } catch {
    return null
  }
}