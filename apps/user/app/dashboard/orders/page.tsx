"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Package, Truck, XCircle, Clock3 } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;

  product: {
    id: number;
    name: string;
    images: {
      id: number;
      url: string;
    }[];
  };

  variant?: {
    id: number;
    name: string;
    value: string;
  } | null;
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // LOAD ORDERS
  async function loadOrders() {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      // support both formats
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // CANCEL ORDER

  async function cancelOrder(orderId: number) {
    const ok = confirm("Cancel this order?");

    if (!ok) return;

    const res = await fetch("/api/orders/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      alert("Failed to cancel order");
      return;
    }

    loadOrders();
  }

  // LOADING
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 space-y-5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[22px] border border-gray-200 bg-[#f8f8f8] animate-pulse"
          >
            {/* HEADER */}
            <div className="m-2 rounded-[18px] bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200" />

                <div>
                  <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              </div>

              <div className="text-right">
                <div className="h-3 w-10 bg-gray-200 rounded mb-2 ml-auto" />
                <div className="h-5 w-20 bg-gray-200 rounded ml-auto" />
              </div>
            </div>

            {/* PRODUCT */}
            <div className="m-2 rounded-[18px] bg-white p-3">
              <div className="flex gap-3">
                <div className="w-28 h-28 rounded-xl bg-gray-200" />

                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="m-2 rounded-[18px] bg-white p-4 flex items-center justify-between">
              <div className="h-4 w-32 bg-gray-200 rounded" />

              <div className="flex gap-2">
                <div className="h-9 w-20 rounded-xl bg-gray-200" />
                <div className="h-9 w-20 rounded-xl bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 space-y-5">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="text-gray-500 mt-1">Track and manage your orders</p>
        </div>

        <div className="hidden md:block bg-white border rounded-xl px-4 py-2 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>

          <p className="text-xl font-bold">{orders.length}</p>
        </div>
      </div>

      {/* EMPTY */}

      {!loading && orders.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl py-16 px-6 text-center shadow-sm">
          {/* ICON */}
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gray-100">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          {/* TITLE */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            No Orders Yet
          </h2>

          {/* DESCRIPTION */}
          <p className="mt-3 text-sm md:text-base text-gray-500 max-w-md mx-auto">
            Looks like you haven't placed any orders yet. Start shopping and
            discover amazing products.
          </p>

          {/* BUTTON */}
          <button
            onClick={() => router.push("/")}
            className="mt-8 inline-flex items-center justify-center h-12 px-8 rounded-2xl bg-black text-white font-medium hover:bg-gray-800 active:scale-95 transition"
          >
            Continue Shopping
          </button>
        </div>
      )}

      {/* ORDERS */}

      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
          className=" overflow-hidden rounded-[22px] border-4 border-gray-200 bg-[#f3f3f3] shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] transition-all duration-200"
        >
          {/* HEADER */}
          <div className="m-2 rounded-[18px] bg-white px-4 py-3 flex items-center justify-between">
            {/* LEFT - STATUS */}
            <div className="flex items-center gap-3">
              {order.status === "COMPLETED" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : order.status === "CONFIRMED" ? (
                <Truck className="w-5 h-5 text-blue-600" />
              ) : order.status === "PACKED" ? (
                <Package className="w-5 h-5 text-purple-600" />
              ) : order.status === "CANCELLED" ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Clock3 className="w-5 h-5 text-yellow-600" />
              )}

              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Order Status
                </p>

                <p
                  className={`text-sm font-semibold ${
                    order.status === "COMPLETED"
                      ? "text-green-600"
                      : order.status === "CONFIRMED"
                        ? "text-blue-600"
                        : order.status === "PACKED"
                          ? "text-purple-600"
                          : order.status === "CANCELLED"
                            ? "text-red-600"
                            : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </p>
              </div>
            </div>

            {/* RIGHT - TOTAL */}
            <div className="text-right leading-tight">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                Total
              </p>

              <p className="text-lg md:text-xl font-bold text-gray-900">
                ₹{Number(order.total).toLocaleString("en-IN")}
              </p>

              <p className="text-[10px] text-green-600 font-medium">
                Best Price
              </p>
            </div>
          </div>

          {/* PRODUCT PREVIEW */}
          <div className="mx-2 rounded-[18px] bg-white p-3">
            <div className="flex items-center gap-3">
              {/* IMAGE COLLAGE */}

              <div className="flex-shrink-0">
                <div
                  className={`
          grid gap-1
          ${
            order.items.length === 1
              ? "grid-cols-1 w-14 h-14"
              : order.items.length === 2
                ? "grid-cols-2 grid-rows-1 w-28 h-14"
                : "grid-cols-2 grid-rows-2 w-28 h-28"
          }
        `}
                >
                  {order.items.slice(0, 4).map((item: any, index: number) => {
                    const image =
                      item.product?.images?.[0]?.url || "/placeholder.png";

                    const remaining = order.items.length - 4;

                    return (
                      <div
                        key={item.id}
                        className={`
                relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100

                ${order.items.length <= 2 ? "w-[54px] h-[54px]" : ""}

                ${
                  order.items.length === 3 && index === 2
                    ? "col-span-2 justify-self-center w-[54px] h-[54px]"
                    : ""
                }
              `}
                      >
                        <Image
                          src={image}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-cover"
                          unoptimized
                        />

                        {index === 3 && remaining > 0 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              +{remaining}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRODUCT DETAILS */}

              <div className="flex-1 min-w-0 space-y-2">
                {order.items.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="flex items-center justify-center min-w-[38px] h-5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                      {item.quantity}x
                    </span>

                    <span className="text-sm text-gray-900 truncate">
                      {item.product?.name}
                    </span>
                  </div>
                ))}

                {order.items.length > 3 && (
                  <div className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">
                    <span className="text-[11px] font-medium text-gray-600">
                      + {order.items.length - 3} more products
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="m-2 rounded-[18px] bg-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* ORDER DATE */}
            <div className="flex flex-col">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                Order Date
              </p>

              <div className="flex items-center gap-1 mt-1">
                <p className="text-sm md:text-base font-semibold text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <span className="text-xs text-gray-300">•</span>

                <p className="text-xs text-gray-500 font-medium">
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 flex-wrap md:justify-end">
              {/* CANCEL */}
              {order.status === "PENDING" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelOrder(order.id);
                  }}
                  className="h-9 px-5 rounded-xl border border-red-200 text-red-600 text-sm font-medium bg-red-50 hover:bg-red-100 active:scale-95 transition"
                >
                  Cancel
                </button>
              )}

              {/* REORDER */}
              {order.status === "COMPLETED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="h-9 px-5 rounded-xl border border-green-200 text-green-600 text-sm font-medium bg-green-50 hover:bg-green-100 active:scale-95 transition"
                >
                  Reorder
                </button>
              )}

              {/* VIEW DETAILS*/}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/orders/${order.id}`);
                }}
                className="h-9 px-5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium bg-gray-50 hover:bg-gray-100 active:scale-95 transition"
              >
                View
              </button>
            </div>
          </div>

          {/* CANCELLED REASON BAR */}

          {order.status === "CANCELLED" && (
            <div className="px-4 py-2 bg-red-600 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Reason:
                </span>

                <span className="text-sm font-medium">
                  {" "}
                  This order was cancelled
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
