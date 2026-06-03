import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../app/lib/getUserFromRequest";
import { addressSchema } from "../../../app/lib/validators/address";

// GET ALL ADDRESSES
export async function GET() {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("GET ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch addresses",
      },
      {
        status: 500,
      }
    );
  }
}

// CREATE ADDRESS
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message,
        },
        {
          status: 400,
        }
      );
    }

    const {
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      isDefault,
      type,
    } = parsed.data;

    const address = await prisma.$transaction(async (tx) => {
      const totalAddresses = await tx.address.count({
        where: {
          userId: user.id,
        },
      });

      let defaultAddress = Boolean(isDefault);

      if (totalAddresses === 0) {
        defaultAddress = true;
      }

      if (defaultAddress) {
        await tx.address.updateMany({
          where: {
            userId: user.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.create({
        data: {
          userId: user.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
          line1: line1.trim(),
          line2: line2?.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          type,
          isDefault: defaultAddress,
        },
      });
    });

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create address",
      },
      {
        status: 500,
      }
    );
  }
}