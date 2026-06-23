"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validators/auth";
import { Edit3, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfileContent({ user, defaultAddress }: any) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user.username || "",
      phone: user.phone || "",
    },
  });

  async function onProfileSubmit(data: UpdateProfileInput) {
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to update profile");
        return;
      }
      // PHONE CHANGE

      if (result.phoneChanged) {
        toast.success("OTP sent to new phone");

        setProfileOpen(false);

        router.push(`/verify-otp?phone=${result.phone}&type=change-phone`);

        return;
      }
      toast.success("Profile updated successfully");
      setProfileOpen(false);
      router.refresh();

      reset({
        username: data.username,
        phone: data.phone,
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-12 antialiased flex justify-center text-slate-800 relative">
      <div className="w-full max-w-4xl space-y-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:border-orange-200 hover:bg-orange-50 transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-[#f07b1a]" />
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  My Profile
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Manage your account details and preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-sm flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
              {user.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {user.username || "User"}
            </h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                {user.role}
              </span>

              {user.isVerified && (
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Info */}

        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h2>
            </div>

            <button
              onClick={() => setProfileOpen(true)}
              className="w-full sm:w-auto justify-center bg-[#f07b1a] hover:bg-[#d96a12] active:scale-95 transition-all text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm shadow-orange-500/20"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-y-8 sm:gap-x-12">
            <InfoItem label="User name" value={user.username || "-"} />

            <InfoItem label="Phone Number" value={user.phone} />

            <InfoItem label="User Role" value={user.role} />

            <InfoItem
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Account Status
              </span>

              <div className="mt-0.5">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}

        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Default Address
              </h2>

              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {defaultAddress?.type || "HOME"}
              </span>
            </div>

            <button
              onClick={() => router.push("/dashboard/addresses")}
              className="w-full sm:w-auto justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit Address
            </button>
          </div>

          {defaultAddress ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-y-8 sm:gap-x-12">
              <InfoItem
                label="Contact Person"
                value={defaultAddress.fullName}
                subValue={defaultAddress.phone}
              />

              <InfoItem
                label="Address"
                value={defaultAddress.line1}
                subValue={defaultAddress.line2}
              />

              <InfoItem
                label="City & State"
                value={defaultAddress.city}
                subValue={defaultAddress.state}
              />

              <InfoItem label="Pincode" value={defaultAddress.pincode} />
            </div>
          ) : (
            <p className="text-slate-500">No default address found.</p>
          )}
        </div>
      </div>

      {/* Profile Modal */}

      {profileOpen && (
        <Modal title="Edit Profile" onClose={() => setProfileOpen(false)}>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Username
              </label>

              <input
                {...register("username")}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#f07b1a] focus:outline-none focus:ring-1 focus:ring-[#f07b1a]"
              />

              {errors.username && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Phone Number
              </label>

              <input
                {...register("phone")}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#f07b1a] focus:outline-none focus:ring-1 focus:ring-[#f07b1a]"
              />

              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#f07b1a] hover:bg-[#d96a12] text-white px-5 py-2.5 rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <span className="text-[15px] font-medium text-slate-900 break-all">
        {value}
      </span>

      {subValue && (
        <span className="text-[13px] text-slate-500 mt-0.5">{subValue}</span>
      )}
    </div>
  );
}

type ModalProps = {
  children: ReactNode;
  title: string;
  onClose: () => void;
};

function Modal({ children, title, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">{children}</div>
      </div>
    </div>
  );
}
