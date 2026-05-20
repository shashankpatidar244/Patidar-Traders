"use client";
import Link from "next/link";

export default function SigninPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        action="/api/auth/login"   // ✅ HTML form submits directly to API
        method="POST"
        className="w-full max-w-md space-y-4 p-6 border rounded-lg"
      >
        <h1 className="text-2xl font-bold text-center">Login</h1>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded"
        >
          Login
        </button>

        <div className="text-center text-sm mt-2">
        <Link href="/forgot-password" className="underline">
          Forgot Password?
        </Link>
        </div>
      </form>
    </div>
  );
}