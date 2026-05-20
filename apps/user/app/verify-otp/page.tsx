"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema } from "@/lib/validators/auth";
import { z } from "zod";
import { useEffect } from "react";

type FormData = z.infer<typeof verifyOtpSchema>;

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const type = searchParams.get("type");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phone: phone || "",
    },
  });

  // ✅ Prevent direct access without phone
  useEffect(() => {
    if (!phone) {
      router.push("/signup");
    }
  }, [phone, router]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type, // ✅ IMPORTANT
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Invalid OTP");
        return;
      }

      // ✅ Use backend redirect
      if (result.success && result.redirect) {
        router.push(result.redirect);
      }

    } catch (error) {
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-6 border rounded w-80"
      >
        <h1 className="text-xl font-bold text-center">
          Verify OTP
        </h1>

        <input
          type="hidden"
          {...register("phone")}
        />

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          {...register("otp")}
          className="border p-2 rounded text-center"
        />
        {errors.otp && (
          <p className="text-red-500 text-sm">
            {errors.otp.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white p-2 rounded"
        >
          {isSubmitting ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}