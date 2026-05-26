"use client";

import { MapPin, Phone, User2, Truck, Navigation } from "lucide-react";

export default function OrderAddress({ order }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-gray-700">
            SHIPPING ADDRESS
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Delivery destination details
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <Truck size={18} />
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* CUSTOMER */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <User2 size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-gray-500">Recipient</p>

            <h3 className="font-semibold text-gray-900 truncate">
              {order.shippingName}
            </h3>
          </div>
        </div>

        {/* PHONE */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-green-700">
            <Phone size={18} />
          </div>

          <div>
            <p className="text-xs text-gray-500">Contact Number</p>

            <p className="font-medium text-gray-900">{order.shippingPhone}</p>
          </div>
        </div>

        {/* ADDRESS */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <MapPin size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Full Address</p>

            <div className="text-sm text-gray-700 leading-relaxed space-y-1">
              <p>{order.shippingLine1}</p>

              {order.shippingLine2 && <p>{order.shippingLine2}</p>}

              <p>
                {order.shippingCity}, {order.shippingState}
              </p>

              <p className="font-medium">{order.shippingPincode}</p>
            </div>
          </div>
        </div>

        {/* DELIVERY STATUS */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
              <Navigation size={18} />
            </div>

            <div>
              <p className="text-xs text-gray-500">Delivery Status</p>

              <p className="font-semibold text-gray-900">
                {order.deliveryStatus || "PENDING"}
              </p>
            </div>
          </div>

          <span
            className="
              px-3 py-1 rounded-full
              text-xs font-semibold
              bg-blue-50 text-blue-700 border border-blue-200
            "
          >
            {order.deliveryStatus || "PENDING"}
          </span>
        </div>
      </div>
    </div>
  );
}
