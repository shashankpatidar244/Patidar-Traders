export function TableSkeleton() {
    return (
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
  
        {/* Header Skeleton */}
        <div className="grid grid-cols-8 gap-4 p-4 border-b bg-gray-50">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-3 bg-gray-200 rounded w-3/4"
            />
          ))}
        </div>
  
        {/* Rows */}
        <div className="animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-8 gap-4 p-4 border-b items-center"
            >
              <div className="h-4 bg-gray-200 rounded w-10" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-5 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="flex gap-2">
                <div className="h-6 w-12 bg-gray-200 rounded" />
                <div className="h-6 w-12 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }