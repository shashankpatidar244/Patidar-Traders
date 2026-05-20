export default function UnauthorizedPage() {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded shadow text-center">
          <h1 className="text-xl font-bold text-red-500">
            Access Denied ❌
          </h1>
          <p className="text-gray-500 mt-2">
            You don't have permission to view this page
          </p>
        </div>
      </div>
    )
  }