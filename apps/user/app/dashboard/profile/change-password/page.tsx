"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "../../../lib/validators/auth";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Watch fields for real-time UI updates
  const newPassword = watch("newPassword") || "";
  const confirmPassword = watch("confirmPassword") || "";

  // UI States
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Real-time Validation Logic for UI
  const passLengthValid = newPassword.length >= 6;
  const allRequirementsMet = passLengthValid;
  const passwordsMatch =
    confirmPassword !== "" && newPassword === confirmPassword;

  // Track Caps Lock Globally
  useEffect(() => {
    const handleCheckCapsLock = (e: KeyboardEvent) => {
      setCapsLockActive(e.getModifierState?.("CapsLock") ?? false);
    };

    window.addEventListener("keydown", handleCheckCapsLock);
    window.addEventListener("keyup", handleCheckCapsLock);

    return () => {
      window.removeEventListener("keydown", handleCheckCapsLock);
      window.removeEventListener("keyup", handleCheckCapsLock);
    };
  }, []);

  // Real-time Password Strength Entropy Calculator
  const calculateStrength = (password: string) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strengthScore = calculateStrength(newPassword);

  const getStrengthBarConfig = () => {
    if (strengthScore === 0)
      return { label: "", color: "bg-slate-200", textClass: "" };
    if (strengthScore >= 3 && strengthScore < 4)
      return {
        label: "Moderate",
        color: "bg-amber-500",
        textClass: "text-amber-500",
      };
    if (strengthScore === 4)
      return {
        label: "Strong",
        color: "bg-emerald-500",
        textClass: "text-emerald-500",
      };
    return { label: "Weak", color: "bg-rose-500", textClass: "text-rose-500" };
  };

  const strengthConfig = getStrengthBarConfig();

  // API Submission Handler
  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result.error || "Update failed. Please check your current password."
        );
        return;
      }

      toast.success("Password changed successfully");
      reset();

      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to the server.");
    }
  };

  const currentPassword = watch("currentPassword") || "";

  const passwordChanged =
    currentPassword !== "" &&
    newPassword !== "" &&
    currentPassword !== newPassword;

  // Helper to determine border color based on validation
  const getBorderColor = (
    fieldValue: string,
    isValid: boolean,
    hasError: boolean
  ) => {
    if (hasError)
      return "border-rose-300 focus:ring-rose-100 focus:border-rose-500";

    if (fieldValue === "")
      return "border-slate-200 focus:ring-orange-100 focus:border-[#f07b1a]";

    if (isValid)
      return "border-emerald-500 focus:ring-emerald-100 focus:border-emerald-500";

    return "border-rose-300 focus:ring-rose-100 focus:border-rose-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-12 antialiased flex justify-center text-slate-800 relative">
      <div className="w-full max-w-2xl space-y-6 relative z-10 text-slate-800 antialiased">
        {/* Header*/}
        <div className="mb-6 md:mb-8 text-left sm:text-left flex flex-col items-left sm:items-start">
          <button
            onClick={() => router.back()}
            className="inline-flex items-left gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors group focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Profile
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Update Password
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose a password that is easy for you to remember and hard for
            others to guess.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200/60 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Caps Lock Warning */}
            {capsLockActive && (
              <div className="rounded-xl p-3 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                Warning: Caps Lock is enabled!
              </div>
            )}

            {/* Current Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Password
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs font-semibold text-[#f07b1a] hover:text-[#d96a12] transition-colors focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("currentPassword")}
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 transition-all ${
                    errors.currentPassword
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-orange-100 focus:border-[#f07b1a]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showCurrent ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* New Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  New Password
                </label>
                <span
                  className={`text-xs font-semibold ${strengthConfig.textClass || "text-slate-400"}`}
                >
                  {strengthConfig.label}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("newPassword")}
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${getBorderColor(newPassword, allRequirementsMet, !!errors.newPassword)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showNew ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Entropy Bars */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`h-full w-1/4 transition-colors duration-300 ${
                      index <= strengthScore
                        ? strengthConfig.color
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirm New Password
                </label>
                {confirmPassword !== "" && (
                  <span
                    className={`text-xs font-semibold ${passwordsMatch ? "text-emerald-600" : "text-rose-500"}`}
                  >
                    {passwordsMatch
                      ? "Passwords Match"
                      : "Passwords Do Not Match"}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${getBorderColor(confirmPassword, passwordsMatch, !!errors.confirmPassword)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements Checklist */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Password Requirements
              </h4>
              <ul className="space-y-2 text-xs font-medium transition-all">
                <li className="flex items-center gap-2">
                  <Check
                    className={`w-4 h-4 shrink-0 ${
                      passLengthValid ? "text-emerald-500" : "text-slate-300"
                    }`}
                  />
                  <span
                    className={
                      passLengthValid ? "text-slate-700" : "text-slate-400"
                    }
                  >
                    Password must be at least 6 characters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    className={`w-4 h-4 ${
                      passwordChanged ? "text-emerald-500" : "text-slate-300"
                    }`}
                  />
                  <span
                    className={
                      passwordChanged ? "text-slate-700" : "text-slate-400"
                    }
                  >
                    New password must be different from current password
                  </span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !passLengthValid ||
                  !passwordsMatch ||
                  !passwordChanged
                }
                className="bg-[#f07b1a] hover:bg-[#d96a12] text-white px-6 py-2.5 text-sm font-medium rounded-lg shadow-sm shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center min-w-[150px]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
