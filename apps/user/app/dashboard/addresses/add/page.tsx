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

  const isFormValid = addressSchema.safeParse(form).success;

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setIsDirty(true);

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
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
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          const data = await res.json();

          const address = data.address || {};

          setForm((prev) => ({
            ...prev,
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            pincode: address.postcode || "",
            line1:
              address.road || address.suburb || address.neighbourhood || "",
          }));

          toast.success("Location detected successfully");
        } catch {
          toast.error("Failed to fetch address");
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location unavailable");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out");
            break;
          default:
            toast.error("Unable to get location");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
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
      const fieldErrors: Record<string, string> = {};

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);

      toast.error("Please fix highlighted fields");

      return;
    }

    setErrors({});

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

      toast.success(
        form.isDefault
          ? "🏠 Default address added successfully"
          : "📍 Address added successfully",
        {
          duration: 3000,
        }
      );

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-slate-100">
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
            className="group relative h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <ArrowLeft
              size={20}
              className="relative z-10 text-slate-700 transition-all duration-300 group-hover:text-indigo-600 group-hover:-translate-x-0.5"
            />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-900">Add Address</h1>
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
          <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
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
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-xl shadow-slate-100/50">
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
              <div className="flex items-center gap-3 mb-5">
                <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />

                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800 whitespace-nowrap">
                  Contact Information
                </h3>

                <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 via-slate-200 to-transparent" />
              </div>

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
                      onChange={(e) => {
                        const value = e.target.value;

                        updateField("fullName", value);

                        if (
                          value.trim().length > 0 &&
                          value.trim().length < 3
                        ) {
                          setErrors((prev) => ({
                            ...prev,
                            fullName: "Full name must be at least 3 characters",
                          }));
                        }
                      }}
                      placeholder="Enter full name"
                      className={`${inputClass} ${
                        errors.fullName ? "border-red-500" : ""
                      }pl-11 pr-4 py-3 text-sm resize-none outline-none`}
                    />
                  </div>
                  {errors.fullName ? (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fullName}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1">
                      Enter receiver's full name
                    </p>
                  )}
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
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        updateField("phone", value);

                        if (value.length > 0 && value.length < 10) {
                          setErrors((prev) => ({
                            ...prev,
                            phone: "Mobile number must contain 10 digits",
                          }));
                        }

                        if (value.length === 10) {
                          if (!/^[6-9]\d{9}$/.test(value)) {
                            setErrors((prev) => ({
                              ...prev,
                              phone: "Must start with 6, 7, 8 or 9",
                            }));
                          }
                        }
                      }}
                      placeholder="Enter a 10-digit Indian mobile number"
                      className={`${inputClass} ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }pl-11 pr-4 py-3 text-sm resize-none outline-none`}
                    />
                  </div>
                  {errors.phone ? (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1">
                      Example: 9876543210
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />

                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800 whitespace-nowrap">
                  Address Details
                </h3>

                <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 via-slate-200 to-transparent" />
              </div>

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
                      onChange={(e) => {
                        const value = e.target.value;

                        updateField("line1", value);

                        if (
                          value.trim().length > 0 &&
                          value.trim().length < 10
                        ) {
                          setErrors((prev) => ({
                            ...prev,
                            line1: "Address should be at least 10 characters",
                          }));
                        }
                      }}
                      placeholder="House No, Building Name, Street, Area"
                      className={`w-full rounded-2xl border ${
                        errors.line1 ? "border-red-500" : "border-gray-200"
                      } pl-11 pr-4 py-3 text-sm resize-none outline-none`}
                    />
                    {errors.line1 ? (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.line1}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-xs mt-1">
                        House number, street, colony, area
                      </p>
                    )}
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

                        if (value.length > 0 && value.length < 6) {
                          setErrors((prev) => ({
                            ...prev,
                            pincode: "Pincode must be 6 digits",
                          }));
                        }

                        if (value.length === 6) {
                          setErrors((prev) => ({
                            ...prev,
                            pincode: "",
                          }));

                          fetchPincodeData(value);
                        }
                      }}
                      placeholder="Enter a valid 6-digit pincode"
                      className={`${inputClass} ${
                        errors.pincode
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }pl-11 pr-4 py-3 text-sm resize-none outline-none`}
                    />

                    {errors.pincode && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">City *</label>

                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => {
                        updateField("city", e.target.value);

                        const result = addressSchema.shape.city.safeParse(
                          e.target.value
                        );

                        setErrors((prev) => ({
                          ...prev,
                          city: result.success
                            ? ""
                            : result.error.issues[0]?.message,
                        }));
                      }}
                      placeholder="Enter city"
                      className={`w-full h-12 rounded-xl border px-4 text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/5 ${
                        errors.city ? "border-red-500" : "border-gray-200"
                      }`}
                    />

                    {errors.city ? (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    ) : (
                      <p className="text-gray-400 text-xs mt-1">
                        Enter your city name
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2">State *</label>

                    <input
                      type="text"
                      required
                      value={form.state}
                      onChange={(e) => {
                        updateField("state", e.target.value);

                        const result = addressSchema.shape.state.safeParse(
                          e.target.value
                        );

                        setErrors((prev) => ({
                          ...prev,
                          state: result.success
                            ? ""
                            : result.error.issues[0]?.message,
                        }));
                      }}
                      placeholder="Enter state"
                      className={`w-full h-12 rounded-xl border px-4 text-sm outline-none focus:border-black focus:ring-4 focus:ring-black/5 ${
                        errors.state ? "border-red-500" : "border-gray-200"
                      }`}
                    />

                    {errors.state ? (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.state}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-xs mt-1">
                        Enter your state name
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Type */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />

                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800 whitespace-nowrap">
                  Address Type
                </h3>

                <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 via-slate-200 to-transparent" />
              </div>

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
                    className={`h-14 rounded-2xl border text-sm font-semibold transition-all ${
                      form.type === item.value
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Address */}
            <label
              className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                form.isDefault
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Set as default address
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  We'll pre-select this address for your next order.
                </p>
              </div>

              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => updateField("isDefault", e.target.checked)}
                  className="peer sr-only"
                />

                <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-green-500" />

                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </div>
            </label>

            {/* Bottom Action */}
            <div className="max-w-xl mx-auto ">
              {!isFormValid && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <span className="mt-0.5 text-amber-600">⚠️</span>

                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Complete all required fields
                    </p>

                    <p className="mt-1 text-xs text-amber-700">
                      Fields marked with * are mandatory before you can save.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                form="address-form"
                disabled={loading || !isFormValid}
                className={`w-full h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  loading || !isFormValid
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving Address...
                  </>
                ) : (
                  <>
                    <MapPin size={18} />

                    {isFormValid ? "Save Address" : "Complete Required Fields"}
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-2">
                Your delivery address will be used for future orders
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
