import { prisma } from "@repo/database";
import { getUserFromRequest } from "../../lib/getUserFromRequest";
import { redirect } from "next/navigation";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      redirect("/signin");
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        addresses: true,
      },
    });

    if (!dbUser) {
      redirect("/signin");
    }

    const defaultAddress =
      dbUser.addresses.find((a) => a.isDefault) || dbUser.addresses[0] || null;

    return <ProfileContent user={dbUser} defaultAddress={defaultAddress} />;
  } catch (error) {
    console.error("PROFILE PAGE ERROR:", error);

    redirect("/signin");
  }
}
