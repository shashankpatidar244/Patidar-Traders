"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlState() {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // RESET PAGE
    if (Object.keys(updates).some((k) => k !== "page" && k !== "limit")) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  function resetParams() {
    router.push(pathname, {
      scroll: false,
    });
  }

  return {
    searchParams,
    updateParams,
    resetParams,
  };
}
