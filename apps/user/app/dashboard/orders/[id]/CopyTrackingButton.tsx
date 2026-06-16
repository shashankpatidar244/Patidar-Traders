"use client";

import toast from "react-hot-toast";

interface CopyTrackingButtonProps {
  trackingId: string;
}

export default function CopyTrackingButton({
  trackingId,
}: CopyTrackingButtonProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(trackingId);

      toast.success("Tracking ID copied");
    } catch {
      toast.error("Failed to copy tracking ID");
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-bold text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-indigo-300 transition-colors shadow-sm"
    >
      Copy Link
    </button>
  );
}
