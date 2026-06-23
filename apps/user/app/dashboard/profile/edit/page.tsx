"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileSchema } from "@/lib/validators/auth";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/profile/update");

        if (res.ok) {
          const data = await res.json();

          setUsername(data.username || "");
          setPhone(data.phone || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setFetching(false);
      }
    }

    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Error: Image exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Zod Validation
    const result = updateProfileSchema.safeParse({ username, phone });

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input";

      setError(firstError);
      toast.error(firstError);
      setLoading(false);

      return;
    }

    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (data.phoneChanged) {
        toast.success("OTP sent to new phone");

        router.push(`/verify-otp?phone=${phone}&type=change-phone`);

        return;
      }

      if (res.ok) {
        toast.success("Profile updated successfully");

        router.refresh();

        setTimeout(() => {
          router.push("/dashboard/profile");
        }, 800);
      } else {
        toast.error(data.error || "Update failed");
        setError(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#f07b1a]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 md:p-12 text-slate-800">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Edit Profile
          </h1>
          <p className="text-slate-500">
            Update your personal account information.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Alert Box */}
              {error && (
                <div className="rounded-xl p-4 text-sm bg-rose-50 text-rose-700 border border-rose-100">
                  {error}
                </div>
              )}
              {/* Photo Upload Section */}
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    // onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer inline-block bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all"
                  >
                    Change Photo
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-[11px] text-slate-400">
                    JPG, PNG or WEBP (Max 2MB)
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0000000000"
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#f07b1a] hover:bg-[#d96a12] text-white px-8 py-3 text-sm font-semibold rounded-lg shadow-md transition-all flex items-center justify-center min-w-[140px]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
