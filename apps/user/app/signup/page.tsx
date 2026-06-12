"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validators/auth";
import { z } from "zod";

type FormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        router.push(`/verify-otp?phone=${data.phone}`);
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch {
      alert("Failed to send OTP");
    }
  };

  return (
    <div className="min-h-screen bg-sky-500 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">
        
        {/* LEFT PANEL */}
        <div
          className="relative hidden md:block"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900/40 to-black/30" />

          <div className="relative z-10 h-full flex flex-col justify-between p-10 text-white">
            <div>
              <h1 className="text-5xl font-bold">
                Make It
              </h1>

              <p className="mt-4 text-lg text-white/90 max-w-sm">
                Start your journey and manage everything from one powerful platform.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">
                Join Us 🚀
              </h2>

              <p className="text-white/80">
                Create your account and get started today.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md"
          >
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-bold text-sky-500">
                Create Account
              </h1>

              <p className="mt-2 text-gray-500">
                Enter your phone number to continue
              </p>
            </div>

            {/* PHONE */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                placeholder="Enter phone number"
                {...register("phone")}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />

              {errors.phone && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white shadow-lg transition hover:bg-sky-600 disabled:opacity-50"
            >
              {isSubmitting
                ? "Sending OTP..."
                : "Send OTP"}
            </button>

            {/* LOGIN LINK */}
            <div className="mt-8 text-center text-gray-500">
              Already have an account?
            </div>

            <Link href="/signin">
              <button
                type="button"
                className="mt-4 w-full rounded-xl border-2 border-sky-500 py-3 font-semibold text-sky-500 transition hover:bg-sky-50"
              >
                Sign In
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}