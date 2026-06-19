import CheckoutClient from "./CheckoutClient";
import CheckoutStepper from "./CheckoutStepper";
import { getUserFromRequest } from "../lib/getUserFromRequest";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const user = await getUserFromRequest();
  if (!user) redirect("/signin");

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-b from-[#fcfcfd] via-white to-zinc-50 text-zinc-900">
      <CheckoutStepper step={2} />

      {/* Order Summary + Checkout UI */}
      <CheckoutClient />
    </div>
  );
}
