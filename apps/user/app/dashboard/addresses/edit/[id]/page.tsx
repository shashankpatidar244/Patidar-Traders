"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
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

    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, id, router]);

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
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-lg mx-auto h-14 px-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                const confirmed = window.confirm(
                  "You have unsaved changes. Leave anyway?"
                );

                if (!confirmed) return;
              }

              router.back();
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="font-semibold text-lg">Edit Address</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          {/* Top Section */}
          <div className="p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
                <MapPin size={22} />
              </div>

              <div>
                <h2 className="font-bold text-lg">Update Address</h2>

                <p className="text-sm text-gray-500">
                  Edit your delivery address
                </p>
              </div>
            </div>
          </div>

          <form
            id="address-form"
            onSubmit={handleUpdate}
            className="p-5 space-y-5"
          >
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => {
                  const value = e.target.value;

                  updateField("fullName", value);

                  if (value.trim().length > 0 && value.trim().length < 3) {
                    setErrors((prev) => ({
                      ...prev,
                      fullName: "Full name must be at least 3 characters",
                    }));
                  }
                }}
                className={`${inputClass} ${
                  errors.fullName ? "border-red-500" : ""
                }`}
              />

              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mobile Number
              </label>

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
                className={inputClass}
                placeholder="9876543210"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Address Line 1
              </label>

              <input
                type="text"
                required
                value={form.line1}
                onChange={(e) => {
                  const value = e.target.value;

                  updateField("line1", value);

                  if (value.trim().length > 0 && value.trim().length < 10) {
                    setErrors((prev) => ({
                      ...prev,
                      line1: "Address should be at least 10 characters",
                    }));
                  }
                }}
                className={`${inputClass} ${
                  errors.line1 ? "border-red-500" : ""
                }`}
                placeholder="House No, Building, Street"
              />
              {errors.line1 && (
                <p className="text-red-500 text-xs mt-1">{errors.line1}</p>
              )}
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-sm font-medium mb-2">Landmark</label>

              <input
                type="text"
                value={form.line2}
                onChange={(e) => updateField("line2", e.target.value)}
                className={inputClass}
                placeholder="Near school, temple, mall"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>

                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => {
                    const value = e.target.value;

                    updateField("city", value);

                    if (value && !/^[A-Za-z\s.-]+$/.test(value)) {
                      setErrors((prev) => ({
                        ...prev,
                        city: "City name can contain only letters",
                      }));
                    }
                  }}
                  className={`${inputClass} ${
                    errors.city ? "border-red-500" : ""
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State</label>

                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => {
                    const value = e.target.value;

                    updateField("state", value);

                    if (value && !/^[A-Za-z\s.-]+$/.test(value)) {
                      setErrors((prev) => ({
                        ...prev,
                        state: "State name can contain only letters",
                      }));
                    }
                  }}
                  className={`${inputClass} ${
                    errors.state ? "border-red-500" : ""
                  }`}
                />

                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium mb-2">Pincode</label>

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
                className={`${inputClass} ${
                  errors.pincode ? "border-red-500" : ""
                }`}
                placeholder="462001"
              />
              {errors.pincode && (
                <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
              )}
            </div>

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

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t shadow-lg">
        <div className="max-w-xl mx-auto px-4 py-3">
          {!isFormValid && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
              <span>⚠️</span>

              <p className="text-xs text-amber-700">
                Please complete all required fields before updating.
              </p>
            </div>
          )}

          <button
            type="submit"
            form="address-form"
            disabled={saving || !isFormValid}
            className={`w-full h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
              saving || !isFormValid
                ? "bg-gray-300 text-gray-500"
                : "bg-black text-white"
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
                Update Address
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-gray-400 mt-2">
            Changes will be saved to your delivery address
          </p>
        </div>
      </div>
    </div>
  );
}
