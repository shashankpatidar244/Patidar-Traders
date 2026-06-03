"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  MapPin,
} from "lucide-react";

export default function EditAddressPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!id) return;

    async function loadAddress() {
      try {
        const res = await fetch(`/api/address/${id}`);
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Address not found");
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
        });
      } catch {
        router.push("/dashboard/addresses");
      } finally {
        setLoading(false);
      }
    }

    loadAddress();
  }, [id, router]);

  const updateField = (
    key: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  async function handleUpdate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

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
        throw new Error(
          data.error || "Update failed"
        );
      }

      router.push("/dashboard/addresses");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/5";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin"
        />
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
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="font-semibold text-lg">
            Edit Address
          </h1>
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
                <h2 className="font-bold text-lg">
                  Update Address
                </h2>

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
                onChange={(e) =>
                  updateField(
                    "fullName",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="John Doe"
              />
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
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                className={inputClass}
                placeholder="9876543210"
              />
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
                onChange={(e) =>
                  updateField(
                    "line1",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="House No, Building, Street"
              />
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Landmark
              </label>

              <input
                type="text"
                value={form.line2}
                onChange={(e) =>
                  updateField(
                    "line2",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Near school, temple, mall"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  City
                </label>

                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) =>
                    updateField(
                      "city",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  State
                </label>

                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) =>
                    updateField(
                      "state",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pincode
              </label>

              <input
                type="text"
                required
                maxLength={6}
                value={form.pincode}
                onChange={(e) =>
                  updateField(
                    "pincode",
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                className={inputClass}
                placeholder="462001"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
        <div className="max-w-lg mx-auto">
          <button
            type="submit"
            form="address-form"
            disabled={saving}
            className="w-full h-12 rounded-2xl bg-black text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}

            {saving
              ? "Updating Address..."
              : "Update Address"}
          </button>
        </div>
      </div>
    </div>
  );
}