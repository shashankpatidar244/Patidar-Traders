"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Loader2,
  Phone,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

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
  type?: "HOME" | "WORK" | "OTHER";
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/address")
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || []);
        setLoading(false);
      });
  }, []);

  const setDefault = async (id: number) => {
    try {
      setActionLoading(id);

      const res = await fetch("/api/address/set-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error();
      }

      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );

      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update default address");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAddress = async (id: number) => {
    const confirmed = window.confirm("Delete this address?");

    if (!confirmed) return;

    try {
      setActionLoading(id);

      const res = await fetch(`/api/address/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error();
      }

      setAddresses((prev) => prev.filter((a) => a.id !== id));

      toast.success("Address deleted successfully");
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/dashboard");
                }
              }}
              className="group h-11 w-11 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md active:scale-95"
            >
              <ArrowLeft
                size={20}
                className="text-slate-700 transition-all duration-300 group-hover:text-indigo-600 group-hover:-translate-x-0.5"
              />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  My Addresses
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {addresses.length} saved address
                {addresses.length !== 1 ? "es" : ""}
              </p>
            </div>
          </div>

          {/* Desktop CTA */}
          <Link
            href="/dashboard/addresses/add"
            className="hidden sm:flex items-center gap-2 h-11 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
          >
            <Plus size={18} />
            Add Address
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-28">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-3xl border p-10 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <MapPin size={38} className="text-gray-500" />
            </div>

            <h2 className="font-bold text-xl mt-5">No Saved Addresses</h2>

            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Add your delivery address for faster checkout and easier order
              placement.
            </p>

            <Link
              href="/dashboard/addresses/add"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl mt-6"
            >
              <Plus size={18} />
              Add Address
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`group rounded-3xl border bg-white overflow-hidden transition-all duration-300 hover:shadow-lg
                ${
                  addr.isDefault
                    ? "border-green-300 bg-green-50/40"
                    : "border-gray-200"
                }`}
              >
                {/* Top */}
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Select */}
                    <button
                      disabled={actionLoading === addr.id}
                      onClick={() => setDefault(addr.id)}
                      className="shrink-0 mt-1"
                    >
                      {actionLoading === addr.id ? (
                        <Loader2 size={22} className="animate-spin" />
                      ) : addr.isDefault ? (
                        <CheckCircle size={24} className="text-green-600" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </button>

                    {/* Address Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-4">
                        <h2 className="font-semibold text-base">
                          {addr.fullName}
                        </h2>

                        {addr.isDefault && (
                          <span className="px-2.5 py-1 rounded-full bg-green-600 text-white text-[11px] font-medium">
                            Default
                          </span>
                        )}

                        {addr.type && (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium
                            ${
                              addr.type === "HOME"
                                ? "bg-blue-100 text-blue-700"
                                : addr.type === "WORK"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {addr.type === "HOME"
                              ? "🏠 Home"
                              : addr.type === "WORK"
                                ? "🏢 Work"
                                : "📍 Other"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone size={14} />
                        {addr.phone}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 border rounded-2xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex items-center gap-2">
                      <MapPin size={14} className="text-gray-500" />

                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Delivery Address
                      </span>
                    </div>

                    <div className="py-2 px-4">
                      <p className="text-sm font-medium text-gray-900 leading-6">
                        {addr.line1}
                        {addr.line2 && `, ${addr.line2}`}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link
                      href={`/dashboard/addresses/edit/${addr.id}`}
                      className="h-11 rounded-xl border bg-white flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition"
                    >
                      {actionLoading === addr.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Pencil size={16} />
                      )}
                      Edit
                    </Link>

                    <button
                      disabled={actionLoading === addr.id}
                      onClick={() => deleteAddress(addr.id)}
                      className="h-11 rounded-xl border border-red-200 text-red-600 flex items-center justify-center gap-2 hover:bg-red-50 transition"
                    >
                      {actionLoading === addr.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      {addresses.length > 0 && (
        <Link
          href="/dashboard/addresses/add"
          className="sm:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-black text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition"
        >
          <Plus size={24} />
        </Link>
      )}
    </div>
  );
}
