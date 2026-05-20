import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@repo/database'

export async function POST(req: Request) {
  const { phone, password, username } = await req.json()

  const existingUser = await prisma.user.findUnique({
    where: { phone }
  })

  if (existingUser) {
    return NextResponse.json(
      { error: 'Phone already exists' },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      phone,
      username,
      password: hashedPassword,
      role: 'USER'
    }
  })

  return NextResponse.json({ success: true, user })
}