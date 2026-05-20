export default function EmptyState({ message }: { message?: string }) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        
        {/* Icon */}
        <div className="text-5xl mb-4">💳</div>
  
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-700">
          No Payments Found
        </h2>
  
        {/* Message */}
        <p className="text-sm text-gray-500 mt-1">
          {message || "Try changing filters or search"}
        </p>
  
      </div>
    )
  }