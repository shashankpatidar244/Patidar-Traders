"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  User,
  Phone,
  MapPin,
  Home,
  Navigation,
} from "lucide-react";

import toast from "react-hot-toast";
import { addressSchema } from "../../../lib/validators/address";

type AddressType = "HOME" | "WORK" | "OTHER";

export default function AddAddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/dashboard/addresses";

  const [form, setForm] = useState<{
    fullName: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
    type: AddressType;
  }>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
    type: "HOME",
  });

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setIsDirty(true);

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchPincodeData = async (pincode: string) => {
    if (pincode.length !== 6) return;

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      const data = await res.json();

      console.log({
        status: res.status,
        data,
      });

      if (data?.[0]?.Status !== "Success") return;

      const office = data?.[0]?.PostOffice?.[0];

      setForm((prev) => ({
        ...prev,
        city: office?.District || "",
        state: office?.State || "",
      }));
    } catch {
      toast.error("Unable to fetch location");
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async () => {
        toast.success("Location detected. Auto-fill coming soon.");

        // reverse geocode later
      },
      () => {
        toast.error("Unable to get location");
      }
    );
  };

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("HANDLE SUBMIT");

    console.log("FORM DATA", form);

    if (loading) return;

    const parsed = addressSchema.safeParse(form);
    
    console.log(parsed);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message);
      return;
    }

    if (form.phone.length !== 10) {
      toast.error("Enter valid mobile number");
      return;
    }

    if (form.pincode.length !== 6) {
      toast.error("Enter valid pincode");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      console.log({
        status: res.status,
        data,
      });

      if (!res.ok) {
        throw new Error(data.error || "Failed to save address");
      }

      toast.success("Address saved successfully");

      setIsDirty(false);

      router.push(redirect);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition-all focus:border-black focus:ring-4 focus:ring-black/5";

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/dashboard/addresses");
              }
            }}
            className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="font-semibold text-lg">Add Address</h1>

            <p className="text-xs text-gray-500">Delivery address details</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Current Location */}
        <button
          type="button"
          onClick={getCurrentLocation}
          className="w-full bg-white border rounded-2xl p-4 flex items-center gap-4 hover:border-black transition"
        >
          <div className="h-12 w-12 rounded-xl bg-black text-white flex items-center justify-center">
            <Navigation size={20} />
          </div>

          <div className="text-left flex-1">
            <p className="font-medium">Use Current Location</p>

            <p className="text-sm text-gray-500">
              Auto fill city, state & address
            </p>
          </div>
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border shadow-sm">
          {/* Section Header */}
          <div className="p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center text-lg">
                📍
              </div>

              <div>
                <h2 className="font-semibold">Delivery Address</h2>

                <p className="text-sm text-gray-500">Enter receiver details</p>
              </div>
            </div>
          </div>

          <form
            id="address-form"
            onSubmit={handleSubmit}
            className="p-5 space-y-6"
          >
            {/* Contact Information */}
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-4">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Full Name *</label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Enter full name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Mobile Number *</label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) =>
                        updateField("phone", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="9876543210"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-4">
                Address Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Full Address *</label>

                  <div className="relative">
                    <Home
                      size={18}
                      className="absolute left-4 top-4 text-gray-400"
                    />

                    <textarea
                      required
                      rows={4}
                      value={form.line1}
                      onChange={(e) => updateField("line1", e.target.value)}
                      placeholder="House No, Building Name, Street, Area"
                      className="w-full rounded-2xl border border-gray-200 pl-11 pr-4 py-3 text-sm resize-none outline-none focus:border-black focus:ring-4 focus:ring-black/5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Landmark</label>

                  <input
                    type="text"
                    value={form.line2}
                    onChange={(e) => updateField("line2", e.target.value)}
                    placeholder="Near school, temple, mall"
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/5"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Pincode *</label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        updateField("pincode", value);

                        if (value.length === 6) {
                          fetchPincodeData(value);
                        }
                      }}
                      placeholder="462001"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">City *</label>

                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="City"
                      className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">State *</label>

                    <input
                      type="text"
                      required
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      placeholder="State"
                      className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Type */}
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-4">
                Address Type
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "🏠 Home",
                    value: "HOME",
                  },
                  {
                    label: "🏢 Work",
                    value: "WORK",
                  },
                  {
                    label: "📍 Other",
                    value: "OTHER",
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      updateField("type", item.value as AddressType)
                    }
                    className={`h-12 rounded-xl border text-sm font-medium transition-all ${
                      form.type === item.value
                        ? "bg-black text-white border-black"
                        : "bg-white hover:border-gray-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Address */}
            <label className="flex items-center justify-between p-4 rounded-2xl border bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium">Set as Default Address</p>

                <p className="text-sm text-gray-500">
                  Automatically use for future orders
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => updateField("isDefault", e.target.checked)}
                className="h-5 w-5"
              />
            </label>
          </form>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-xl mx-auto p-4">
          <button
            type="submit"
            form="address-form"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving Address...
              </>
            ) : (
              <>
                <MapPin size={18} />
                Save Address
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
