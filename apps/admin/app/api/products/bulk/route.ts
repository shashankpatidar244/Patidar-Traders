import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

type BulkAction = "activate" | "deactivate" | "delete";

interface UndoProduct {
  id: number;
  isActive: boolean;
}

interface BulkRequest {
  ids?: number[];
  action?: BulkAction;
  undo?: boolean;
  products?: UndoProduct[];
}

export async function POST(req: Request) {
  try {
    const body: BulkRequest = await req.json();

    //  UNDO SUPPORT

    if (body.undo && body.products && Array.isArray(body.products)) {
      await prisma.$transaction(
        body.products.map((product) =>
          prisma.product.update({
            where: {
              id: product.id,
            },
            data: {
              isActive: product.isActive,
            },
          })
        )
      );

      return NextResponse.json({
        success: true,
        message: "Changes reverted",
      });
    }

    // NORMAL BULK ACTIONS

    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product IDs",
        },
        {
          status: 400,
        }
      );
    }

    if (
      action !== "activate" &&
      action !== "deactivate" &&
      action !== "delete"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action",
        },
        {
          status: 400,
        }
      );
    }

    let updateData: {
      isActive?: boolean;
    } = {};

    switch (action) {
      case "activate":
        updateData.isActive = true;
        break;

      case "deactivate":
        updateData.isActive = false;
        break;

      case "delete":
        // Soft Delete
        updateData.isActive = false;
        break;
    }

    await prisma.product.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} products updated`,
    });
  } catch (error) {
    console.error("PRODUCT_BULK_ACTION_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Bulk operation failed",
      },
      {
        status: 500,
      }
    );
  }
}
