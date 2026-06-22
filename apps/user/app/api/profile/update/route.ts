import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getUserFromRequest } from "../../../../app/lib/getUserFromRequest";
import { updateProfileSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: result.data.username,
        phone: result.data.phone,
      },
    });

    revalidatePath("/dashboard/profile");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
