"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, User, Phone, Home } from "lucide-react";
import toast from "react-hot-toast";
import { addressSchema } from "../../../../lib/validators/address";

type AddressType = "HOME" | "WORK" | "OTHER";

export default function EditAddressPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    type: "HOME" as AddressType,
    isDefault: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});

  const isFormValid = addressSchema.safeParse(form).success;

  useEffect(() => {
    if (!id) return;

    async function loadAddress() {
      try {
        const res = await fetch(`/api/address/${id}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Address not found");
          router.push("/dashboard/addresses");
          return;
        }

        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
          line1: data.line1 || "",
          line2: data.line2 || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          type: data.type || "HOME",
          isDefault: data.isDefault || false,
        });
      } catch {
        router.push("/dashboard/addresses");
      } finally {
        setLoading(false);
      }
    }
    loadAddress();
  }, [id, router]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

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

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsed = addressSchema.safeParse(form);

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

    try {
      setSaving(true);

      const res = await fetch(`/api/address/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      toast.success(
        form.isDefault
          ? "🏠 Default address updated successfully"
          : "📍 Address updated successfully",
        {
          duration: 3000,
        }
      );

      setIsDirty(false);

      router.push("/dashboard/addresses");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  const fetchPincodeData = async (pincode: string) => {
    if (pincode.length !== 6) return;

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      const data = await res.json();

      if (data?.[0]?.Status !== "Success") return;

      const office = data?.[0]?.PostOffice?.[0];

      setForm((prev) => ({
        ...prev,
        city: office?.District || "",
        state: office?.State || "",
      }));

      setErrors((prev) => ({
        ...prev,
        city: "",
        state: "",
      }));
    } catch {
      toast.error("Unable to fetch location");
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/5";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin" />

        <p className="text-sm text-gray-500">Loading address...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-slate-100">
        <div className="max-w-xl mx-auto h-14 px-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/dashboard/addresses");
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
            <h1 className="text-xl font-bold text-slate-900">Edit Address</h1>
            <p className="text-xs text-gray-500">Delivery address details</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Form Card */}
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-xl shadow-slate-100/50">
          {/* Section Header */}
          <div className="p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center text-lg">
                <MapPin size={22} />
              </div>

              <div>
                <h2 className="font-semibold">Update Address</h2>

                <p className="text-sm text-gray-500">
                  Edit your delivery address
                </p>
              </div>
            </div>
          </div>

          <form
            id="address-form"
            onSubmit={handleUpdate}
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
                      className={`${inputClass} pl-11 ${
                        errors.fullName ? "border-red-500" : ""
                      }`}
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
                      className={`${inputClass} pl-11 ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
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
                      className="absolute left-4 top-4 text-gray-400"
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
                      className={`${inputClass} pl-11 ${
                        errors.pincode
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
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
                disabled={saving || !isFormValid}
                className={`w-full h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  saving || !isFormValid
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900 active:scale-[0.98]"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating Address...
                  </>
                ) : (
                  <>
                    <MapPin size={18} />
                    {isFormValid
                      ? "Update Address"
                      : "Complete Required Fields"}
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-2">
                Changes will be saved to your delivery address
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
