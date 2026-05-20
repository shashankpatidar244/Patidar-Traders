import Link from "next/link";


export default async function Home() {
  return (
 
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h1 className="text-3xl font-bold mb-8">Welcome</h1>

          <div className="flex gap-6 mb-10">
            <Link href="/signin">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                Sign In
              </button>
            </Link>

            <Link href="/signup">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
                Sign Up
              </button>
            </Link>
          </div>

      </div>
  );
}

