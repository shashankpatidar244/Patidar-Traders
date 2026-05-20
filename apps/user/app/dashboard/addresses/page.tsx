"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Address {
  id: number;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/address")
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || []);
        setLoading(false);
      });
  }, []);

  const setDefault = async (id: number) => {
    await fetch("/api/address/set-default", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const deleteAddress = async (id: number) => {
    await fetch(`/api/address/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading addresses...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">My Addresses</h1>

        <Link
          href="/dashboard/addresses/add"
          className="bg-black text-white px-5 py-2.5 rounded-lg hover:opacity-80 transition"
        >
          + Add Address
        </Link>
      </div>

      {addresses.length === 0 && (
        <div className="border rounded-xl p-10 text-center bg-gray-50">
          <p className="text-gray-600 mb-4">
            You haven’t added any address yet.
          </p>
          <Link
            href="/dashboard/addresses/add"
            className="bg-black text-white px-4 py-2 rounded-md"
          >
            Add Your First Address
          </Link>
        </div>
      )}

      {/* One by One Address List */}
      <div className="space-y-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`relative border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition
            ${addr.isDefault ? "border-green-400" : "border-gray-200"}`}
          >
            {/* Left Green Bar for Default */}
            {addr.isDefault && (
              <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-xl"></div>
            )}

            <div className="flex justify-between items-start gap-6">
              {/* LEFT SECTION */}
              <div className="flex gap-4 flex-1">
                {/* Default Select Button */}
                <button
                  onClick={() => setDefault(addr.id)}
                  className={`w-6 h-6 mt-1 rounded-full border-2 flex items-center justify-center transition
                  ${
                    addr.isDefault
                      ? "border-green-500 bg-green-500"
                      : "border-gray-400 hover:border-green-500"
                  }`}
                >
                  {addr.isDefault && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  )}
                </button>

                {/* Address Info */}
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-lg">
                      {addr.name}
                    </h2>

                    {addr.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {addr.phone}
                  </p>

                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              </div>

              {/* RIGHT SECTION - ACTIONS */}
              <div className="flex gap-5 text-sm font-medium">
                <Link
                  href={`/dashboard/addresses/edit/${addr.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>

                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}