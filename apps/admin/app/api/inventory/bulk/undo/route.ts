import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

interface UndoStockItem {
  id: number;
  stock: number;
}

export async function PATCH(req: Request) {
  try {
    const { previous }: { previous: UndoStockItem[] } =
      await req.json();

    console.log("UNDO DATA:", previous);

    if (!previous?.length) {
      return NextResponse.json(
        {
          error: "No undo data provided",
        },
        {
          status: 400,
        }
      );
    }

    await Promise.all(
      previous.map((item) =>
        prisma.productVariant.update({
          where: {
            id: item.id,
          },
          data: {
            stock: item.stock,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("UNDO ERROR:", error);

    return NextResponse.json(
      {
        error: "Undo failed",
      },
      {
        status: 500,
      }
    );
  }
}