"use client";

import Link from "next/link";

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-sky-500 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">
        
        {/* LEFT SIDE */}
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
              <h1 className="text-5xl font-bold">Make It</h1>

              <p className="mt-4 text-white/90 text-lg max-w-sm">
                Manage your products, orders and customers from one place.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome Back 👋
              </h2>

              <p className="text-white/80">
                Login to continue your journey.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <form
            action="/api/auth/login"
            method="POST"
            className="w-full max-w-md"
          >
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-bold text-sky-500">
                Welcome
              </h1>

              <p className="text-gray-500 mt-2">
                Login with your account
              </p>
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                required
                placeholder="Enter phone number"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                required
                placeholder="Enter password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
              />
            </div>

            <div className="text-right mb-6">
              <Link
                href="/forgot-password"
                className="text-sm text-sky-600 hover:text-sky-700"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-sky-500 py-3 text-white font-semibold shadow-lg hover:bg-sky-600 transition"
            >
              Login
            </button>

            <div className="mt-8 text-center text-gray-500">
              Don't have an account?
            </div>

            <Link href="/signup">
              <button
                type="button"
                className="mt-4 w-full rounded-xl border-2 border-sky-500 py-3 font-semibold text-sky-500 hover:bg-sky-50 transition"
              >
                Create Account
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}