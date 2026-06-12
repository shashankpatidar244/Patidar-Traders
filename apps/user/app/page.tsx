import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-sky-500 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">
        
        {/* Left Side */}
        <div
          className="relative min-h-[500px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-black/20" />

          <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
            <div>
              <h1 className="text-5xl font-bold mb-3">
                Make It
              </h1>

              <p className="text-lg text-white/90 max-w-md">
                Build, manage and grow your business with a modern platform.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome Back
              </h2>
              <p className="text-white/80">
                Access your dashboard, orders, products and more.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-center justify-center p-10 md:p-16 bg-white">
          <h2 className="text-5xl font-bold text-sky-500 mb-3">
            Welcome
          </h2>

          <p className="text-gray-500 mb-10 text-center">
            Sign in to continue or create a new account
          </p>

          <div className="w-full max-w-sm space-y-5">
            <Link href="/signin">
              <button className="w-full py-4 rounded-xl bg-sky-500 text-white font-semibold text-lg hover:bg-sky-600 transition shadow-lg">
                Sign In
              </button>
            </Link>

            <Link href="/signup">
              <button className="w-full py-4 rounded-xl border-2 border-sky-500 text-sky-500 font-semibold text-lg hover:bg-sky-50 transition">
                Sign Up
              </button>
            </Link>
          </div>

          <div className="mt-10 text-center text-sm text-gray-500">
            Secure • Fast • Reliable
          </div>
        </div>
      </div>
    </main>
  );
}