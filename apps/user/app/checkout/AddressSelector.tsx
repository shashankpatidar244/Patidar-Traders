"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Home,
  Building2,
  LocateFixed,
  CheckCircle2,
  ChevronRight,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

interface Address {
  id: number;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
}

interface Props {
  addresses: Address[];
  selected: number | null;
  setSelected: (id: number) => void;
}

export default function AddressSelector({
  addresses,
  selected,
  setSelected,
}: Props) {
  const [showSelector, setShowSelector] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutRedirect = searchParams.toString()
    ? `/checkout?${searchParams.toString()}`
    : "/checkout";

  const currentAddress =
    addresses.find((a) => a.id === selected) ||
    addresses.find((a) => a.isDefault) ||
    addresses[0];

  function getTypeIcon(type: string) {
    switch (type) {
      case "HOME":
        return <Home className="w-3 h-3" />;
      case "WORK":
        return <Building2 className="w-3 h-3" />;
      default:
        return <LocateFixed className="w-3 h-3" />;
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case "HOME":
        return "Home";
      case "WORK":
        return "Work";
      default:
        return "Other";
    }
  }

  async function deleteAddress(id: number) {
    const confirmed = window.confirm("Delete this address?");

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/address/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error();
      }

      router.refresh();
    } catch {
      alert("Failed to delete address");
    }
  }

  // NO ADDRESS
  if (!addresses.length) {
    return (
      <div className="border rounded-xl p-6 text-center bg-gray-50">
        <MapPin className="w-8 h-8 mx-auto text-gray-400 mb-3" />

        <h3 className="font-semibold">No Address Found</h3>

        <p className="text-sm text-gray-500 mt-2">
          Add a delivery address to continue.
        </p>

        <button
          onClick={() =>
            router.push(
              `/dashboard/addresses/add?redirect=${encodeURIComponent(
                checkoutRedirect
              )}`
            )
          }
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* SELECTED ADDRESS CARD */}
      {!showSelector && currentAddress && (
        <div className="border rounded-lg overflow-hidden bg-white">
          {/* HEADER */}

          <div className="flex items-center justify-between px-3 py-2 border-b bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />

              <span className="font-medium text-sm">Delivering To</span>
            </div>

            <button
              onClick={() => setShowSelector(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Change
            </button>
          </div>

          {/* ADDRESS */}

          <div className="p-3">
            {/* NAME + BADGES */}

            <div className="flex items-center flex-wrap gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700">
                {getTypeIcon(currentAddress.type)}
              </span>
              <h3 className="font-semibold text-sm text-gray-900">
                {currentAddress.fullName}
              </h3>
              {currentAddress.isDefault && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-100 text-green-700">
                  Default
                </span>
              )}
            </div>

            {/* PHONE */}

            <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{currentAddress.phone}</span>
            </div>

            {/* ADDRESS */}

            <div className="flex items-start gap-1.5 mt-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-500 flex-shrink-0" />
              <p className="text-xs text-gray-600 leading-5">
                {currentAddress.line1}

                {currentAddress.line2 && `, ${currentAddress.line2}`}

                {`, ${currentAddress.city}, ${currentAddress.state} - ${currentAddress.pincode}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ADDRESS LIST */}
      {showSelector && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Delivery Address
                </h3>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Select an address for your order delivery
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/addresses/add?redirect=${encodeURIComponent(
                      checkoutRedirect
                    )}`
                  )
                }
                className=" inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-all duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>

              <button
                onClick={() => setShowSelector(false)}
                className="w-8 h-8 rounded-lg border hover:bg-gray-50"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Address List */}
          <div className="space-y-3">
            {addresses.map((address) => {
              const isSelected = selected === address.id;

              return (
                <label
                  key={address.id}
                  onClick={() => setSelected(address.id)}
                  className={` relative block cursor-pointer rounded-2xl border p-4 transition-all duration-200
                          ${
                            isSelected
                              ? "border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                          }
                        `}
                >
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => {
                      setSelected(address.id);
                      setOpenMenu(null);
                    }}
                    className="hidden"
                  />

                  {/* Top Right */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(
                            openMenu === address.id ? null : address.id
                          );
                        }}
                        className=" p-2 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {openMenu === address.id && (
                        <div className="absolute right-0 top-10 w-36 bg-white border rounded-2xl shadow-xl z-20 overflow-hidden ">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);

                              router.push(
                                `/dashboard/addresses/edit/${address.id}?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`
                              );
                            }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);

                              deleteAddress(address.id);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex items-center flex-wrap gap-2 mb-3 pr-16">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {address.fullName}
                    </h4>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {getTypeIcon(address.type)}
                      {getTypeLabel(address.type)}
                    </span>

                    {address.isDefault && (
                      <span className="px-2.5 py-1 rounded-full bg-green-600 text-white text-[10px] font-medium">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Phone className="w-4 h-4" />
                    <span>{address.phone}</span>
                  </div>

                  {/* Address */}
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />

                    <p className="text-sm text-gray-700 leading-6">
                      {address.line1}
                      {address.line2 && `, ${address.line2}`}
                      {`, ${address.city}, ${address.state} - ${address.pincode}`}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t pt-4">
            <button
              onClick={() => setShowSelector(false)}
              disabled={!selected}
              className="
                w-full h-12
                flex items-center justify-center gap-2
                rounded-xl
                bg-black text-white
                font-medium
                hover:bg-gray-900
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-all
              "
            >
              Deliver Here
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
