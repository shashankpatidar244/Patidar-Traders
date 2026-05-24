"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useState, useRef, useEffect } from "react";

import {
  Search,
  X,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
} from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;

  isSortEngine?: boolean;

  placeholder?: string;

  options?: FilterOption[];

  icon?: React.ReactNode;
}

interface SearchFilterBarProps {
  fields: FilterField[];

  globalSearchKey?: string;

  globalSearchPlaceholder?: string;
}

export default function SearchFilterBar({
  fields,

  globalSearchKey = "search",

  globalSearchPlaceholder = "Search across entries...",
}: SearchFilterBarProps) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [dropdownSearchMap, setDropdownSearchMap] = useState<
    Record<string, string>
  >({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  // CLOSE DROPDOWN
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // CREATE QUERY
  function createQueryString(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // RESET PAGE
    params.set("page", "1");

    return params.toString();
  }

  // UPDATE
  function handleUpdate(key: string, value: string | null) {
    const query = createQueryString({
      [key]: value,
    });

    router.push(`${pathname}?${query}`, {
      scroll: false,
    });
  }

  // RESET
  function handleResetAll() {
    router.push(pathname, {
      scroll: false,
    });

    setActiveDropdown(null);
  }

  const globalSearchValue = searchParams.get(globalSearchKey) || "";

  // FILTER GROUPS
  const structuralFilters = fields.filter(
    (f) => f.key !== globalSearchKey && !f.isSortEngine
  );

  const sortFilters = fields.filter((f) => f.isSortEngine);

  // ACTIVE FILTERS
  const activeFiltersCount = Array.from(searchParams.keys()).filter(
    (key) =>
      key !== "page" &&
      key !== "limit" &&
      key !== globalSearchKey &&
      searchParams.get(key)
  ).length;

  // RENDER FILTER
  function renderPillButton(field: FilterField) {
    const currentValue = searchParams.get(field.key) || "";

    const selectedOption = field.options?.find((o) => o.value === currentValue);

    const isOpen = activeDropdown === field.key;

    const isActive = !!currentValue;

    const dropdownSearch = dropdownSearchMap[field.key] || "";

    return (
      <div key={field.key} className="relative">
        <button
          onClick={() => {
            setActiveDropdown(isOpen ? null : field.key);
            setDropdownSearchMap((prev) => ({
              ...prev,
              [field.key]: "",
            }));
          }}
          className={`
            flex items-center gap-2
            px-3.5 py-1.5 rounded-full
            border text-xs font-medium
            transition-all duration-150

            ${
              isActive
                ? `
                  bg-black border-black
                  text-white hover:bg-black/90
                  shadow-sm
                `
                : `
                  bg-white border-gray-200
                  text-gray-700
                  hover:border-gray-300
                  hover:bg-gray-50
                `
            }
          `}
        >
          {field.icon && <span>{field.icon}</span>}

          <span>
            {field.label}

            {isActive && `: ${selectedOption?.label || currentValue}`}
          </span>

          <ChevronDown
            className={`
              w-3.5 h-3.5
              transition-transform

              ${isOpen ? "rotate-180" : ""}
            `}
          />
        </button>

        {isOpen && (
          <div
            className="
              absolute left-0 mt-2 w-64
              bg-white border border-gray-100
              rounded-xl shadow-xl z-50
              py-1.5
            "
          >
            {/* SEARCH */}
            {field.options && field.options.length > 6 && (
              <div
                className="
                    px-2.5 pb-1.5 pt-1
                    border-b border-gray-50
                  "
              >
                <div className="relative">
                  <Search
                    className="
                        absolute left-2.5
                        top-1/2 -translate-y-1/2
                        w-3.5 h-3.5
                        text-gray-400
                      "
                  />

                  <input
                    value={dropdownSearch}
                    onChange={(e) =>
                      setDropdownSearchMap((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={`Search ${field.label.toLowerCase()}...`}
                    className="
                        w-full pl-8 pr-3 py-1
                        text-xs bg-gray-50
                        border border-gray-200
                        rounded-lg

                        focus:outline-none
                        focus:bg-white
                        focus:border-black
                      "
                  />
                </div>
              </div>
            )}

            <div
              className="
    max-h-60 overflow-y-auto
    py-1
  "
            >
              {/* CLEAR OPTION */}
              <button
                onClick={() => {
                  handleUpdate(field.key, null);

                  setActiveDropdown(null);
                }}
                className="
      w-full flex items-center
      justify-between

      px-3.5 py-2
      text-left text-xs
      text-gray-500

      hover:bg-gray-50
      hover:text-gray-900
      transition
    "
              >
                <span>All {field.label}</span>

                {!currentValue && (
                  <Check
                    className="
          w-3.5 h-3.5
          text-black
        "
                  />
                )}
              </button>

              {/* OPTIONS */}
              {field.options
                ?.filter((opt) =>
                  opt.label.toLowerCase().includes(dropdownSearch.toLowerCase())
                )
                .map((opt) => {
                  const isSelected = opt.value === currentValue;

                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleUpdate(field.key, opt.value);

                        setActiveDropdown(null);
                      }}
                      className={`
            w-full flex
            items-center
            justify-between

            px-3.5 py-2
            text-left text-xs
            transition

            ${
              isSelected
                ? `
                  bg-gray-50
                  font-semibold
                  text-black
                `
                : `
                  text-gray-700
                  hover:bg-gray-50
                `
            }
          `}
                    >
                      <span>{opt.label}</span>

                      {isSelected && (
                        <Check
                          className="
                w-3.5 h-3.5
                text-black
              "
                        />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="
        w-full bg-white
        border border-gray-100
        rounded-2xl p-5
        shadow-sm
        space-y-4
      "
    >
      {/* SEARCH */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="
              absolute left-3.5
              top-1/2 -translate-y-1/2
              w-4 h-4 text-gray-400
            "
          />

          <input
            value={globalSearchValue}
            placeholder={globalSearchPlaceholder}
            onChange={(e) => handleUpdate(globalSearchKey, e.target.value)}
            className="
              w-full pl-10 pr-10 py-2.5
              bg-gray-50
              border border-gray-200
              rounded-xl

              focus:bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-black/5
              focus:border-black
            "
          />

          {globalSearchValue && (
            <button
              onClick={() => handleUpdate(globalSearchKey, null)}
              className="
                absolute right-3
                top-1/2 -translate-y-1/2
              "
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleResetAll}
          className="
            flex items-center gap-2
            px-4 py-2.5
            border border-gray-200
            rounded-xl
            hover:bg-gray-50
            text-xs
          "
        >
          <RotateCcw className="w-4 h-4" />

          <span>Clear Filters</span>
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* FILTERS */}
      <div
        className="
          flex flex-wrap items-center
          gap-2.5
        "
        ref={dropdownRef}
      >
        {/* FILTERS */}
        {structuralFilters.length > 0 && (
          <div
            className="
              flex flex-wrap items-center
              gap-2.5
            "
          >
            <div
              className="
                flex items-center gap-1.5
                text-xs font-semibold
                text-gray-400 uppercase
              "
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />

              <span>Filters</span>
            </div>

            {structuralFilters.map(renderPillButton)}
          </div>
        )}

        {/* DIVIDER */}
        {structuralFilters.length > 0 && sortFilters.length > 0 && (
          <div
            className="
                h-4 w-px bg-gray-200
                hidden sm:block
              "
          />
        )}

        {/* SORT */}
        {sortFilters.length > 0 && (
          <div
            className="
              flex flex-wrap items-center
              gap-2.5
            "
          >
            <div
              className="
                flex items-center gap-1.5
                text-xs font-semibold
                text-gray-400 uppercase
              "
            >
              <ArrowUpDown className="w-3.5 h-3.5" />

              <span>Sort</span>
            </div>

            {sortFilters.map(renderPillButton)}
          </div>
        )}

        {/* ACTIVE */}
        {activeFiltersCount > 0 && (
          <span
            className="
              ml-auto
              text-xs
              bg-gray-100
              text-gray-600
              px-2.5 py-1
              rounded-md
            "
          >
            {activeFiltersCount} Active{" "}
            {activeFiltersCount === 1 ? "Filter" : "Filters"}
          </span>
        )}
      </div>
    </div>
  );
}
