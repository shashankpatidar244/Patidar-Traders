import { prisma } from "@repo/database"
import { NextResponse } from "next/server"

enum UserBulkAction {
  BLOCK = "BLOCK",
  UNBLOCK = "UNBLOCK",
}

interface UndoUserState {
  id: number
  isBlocked: boolean
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    if (body.undo) {
      const users =
        body.users as UndoUserState[]

      await prisma.$transaction(
        users.map((user) =>
          prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isBlocked:
                user.isBlocked,
            },
          })
        )
      )

      return NextResponse.json({
        success: true,
      })
    }

    const {
      userIds,
      action,
    }: {
      userIds: number[]
      action: UserBulkAction
    } = body

    if (
      !Array.isArray(userIds) ||
      !userIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "No users selected",
        },
        {
          status: 400,
        }
      )
    }

    let isBlocked: boolean

    switch (action) {
      case UserBulkAction.BLOCK:
        isBlocked = true
        break

      case UserBulkAction.UNBLOCK:
        isBlocked = false
        break

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action",
          },
          {
            status: 400,
          }
        )
    }

    await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
        role: {
          not: "ADMIN",
        },
      },
      data: {
        isBlocked,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    )
  }
}