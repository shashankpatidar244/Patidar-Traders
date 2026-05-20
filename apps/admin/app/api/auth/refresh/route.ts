import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/database'
import {
  verifyRefreshToken,
  signAccessToken
} from '../../../lib/auth'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refreshToken')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }

  const payload: any = verifyRefreshToken(refreshToken)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken }
  })

  if (!storedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const newAccessToken = signAccessToken({
    id: payload.id
  })

  const response = NextResponse.json({ success: true })

  response.cookies.set('accessToken', newAccessToken, {
    httpOnly: true,
    secure: true,
    path: '/'
  })

  return response
}