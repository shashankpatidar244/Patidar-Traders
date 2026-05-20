import { redirect } from "next/navigation";
import { getUserFromRequest } from "../../user/app/lib/getUserFromRequest"; // adjust path if needed

export default async function Home() {
  const user = await getUserFromRequest();

  // ❌ Not logged in
  if (!user) {
    redirect("/login");
  }

  // ❌ Logged in but not admin
  if (user.role !== "ADMIN") {
    redirect("/login");
  }

  // ✅ Admin → go to dashboard
  redirect("/dashboard");
}