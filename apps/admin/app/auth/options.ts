import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@repo/database"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials?: { email: string; password: string }) {
        if (!credentials) return null
        const user = await prisma.user.findUnique({
          where: { phone: credentials.email },
        })
        if (!user) return null

        return {
          ...user,
          id: String(user.id), // 🔥 important for TS
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/auth/login" },
}