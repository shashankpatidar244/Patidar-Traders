"use client";

interface BulkActionButtonProps {
  icon: string;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  color?: "green" | "red" | "blue" | "yellow" | "gray";
  onClick: () => void;
}

const styles = {
  green: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
  red: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
  blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
  yellow: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
  gray: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200",
};

export default function BulkActionButton({
  icon,
  label,
  loading = false,
  disabled = false,
  color = "gray",
  onClick,
}: BulkActionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2

        rounded-xl border

        px-4 py-2

        text-sm font-medium

        transition-all duration-200

        hover:scale-[1.03]
        active:scale-[0.97]

        focus:outline-none focus:ring-2 focus:ring-offset-2

        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:scale-100

        ${styles[color]}
      `}
    >
      {/* ICON */}
      <span className="text-base leading-none">
        {loading ? "⏳" : icon}
      </span>

      {/* LABEL */}
      <span className="whitespace-nowrap">
        {loading ? "Processing..." : label}
      </span>
    </button>
  );
}