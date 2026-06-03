"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface Address {
  id: number;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
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
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 rounded-3xl bg-gray-200 animate-pulse"
          />
        ))}
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
        <div className="bg-white border rounded-3xl p-10 text-center">
          <div className="text-6xl mb-4">📍</div>

          <h2 className="font-semibold text-lg">No Address Added</h2>

          <p className="text-gray-500 mt-2 mb-6">
            Add an address to place orders faster.
          </p>

          <Link
            href="/dashboard/addresses/add"
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl"
          >
            <Plus size={18} />
            Add Address
          </Link>
        </div>
      )}

      {/* One by One Address List */}
      <div className="space-y-6">
        {addresses.map((addr) => (
          <div
          key={addr.id}
          className={`bg-white rounded-3xl border p-5 shadow-sm transition
          ${
            addr.isDefault
              ? "border-black"
              : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-4 flex-1">
              <button
                onClick={() => setDefault(addr.id)}
                className="mt-1"
              >
                {addr.isDefault ? (
                  <CheckCircle
                    size={24}
                    className="text-black"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                )}
              </button>
        
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-base">
                    {addr.fullName}
                  </h2>
        
                  {addr.isDefault && (
                    <span className="text-xs px-2 py-1 rounded-full bg-black text-white">
                      Default
                    </span>
                  )}
                </div>
        
                <p className="text-sm text-gray-500 mt-1">
                  {addr.phone}
                </p>
        
                <div className="flex gap-2 mt-3">
                  <MapPin
                    size={16}
                    className="mt-1 text-gray-400"
                  />
        
                  <p className="text-sm text-gray-700 leading-6">
                    {addr.line1}
                    {addr.line2 &&
                      `, ${addr.line2}`}
                    <br />
                    {addr.city}, {addr.state}{" "}
                    {addr.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        
          <div className="flex gap-3 mt-5">
            <Link
              href={`/dashboard/addresses/edit/${addr.id}`}
              className="flex-1 h-10 border rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <Pencil size={16} />
              Edit
            </Link>
        
            <button
              onClick={() => deleteAddress(addr.id)}
              className="flex-1 h-10 border border-red-200 text-red-600 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}
