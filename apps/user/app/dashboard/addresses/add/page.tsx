"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddAddressPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("/api/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push("/dashboard/addresses");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Address</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(form).map((key) => (
          <input
            key={key}
            placeholder={key}
            className="w-full border p-2 rounded"
            value={(form as any)[key]}
            onChange={(e) =>
              setForm({ ...form, [key]: e.target.value })
            }
          />
        ))}

        <button className="bg-black text-white px-4 py-2 rounded w-full">
          Save Address
        </button>
      </form>
    </div>
  );
}