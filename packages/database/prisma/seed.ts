import { PrismaClient, Role, OrderStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // =============================
  // USERS
  // =============================
  const hashedPassword = await bcrypt.hash("123456", 10)

  const admin = await prisma.user.upsert({
    where: { phone: "9999999999" },
    update: {},
    create: {
      phone: "9999999999",
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      username: "Admin",
    },
  })

  console.log("✅ Seed completed")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })