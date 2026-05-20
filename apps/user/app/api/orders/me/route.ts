import { prisma } from "@repo/database"
import { NextResponse } from "next/server"
import { getUserFromRequest } from "../../../lib/getUserFromRequest"

export async function GET() {

  try {

    const user = await getUserFromRequest()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id
      },

      orderBy: {
        createdAt: "desc"
      },

      include: {
        items: {
          include: {

            product: {
              include: {
                images: true
              }
            },

            variant: true

          }
        }
      }
    })

    return NextResponse.json(orders)

  } catch (error) {

    console.error("Orders fetch error:", error)

    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )

  }

}
