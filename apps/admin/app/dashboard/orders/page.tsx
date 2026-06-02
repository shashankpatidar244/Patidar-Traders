"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import OrderTable from "./components/OrderTable";
import Pagination from "../../components/shared/Pagination";
import BulkActions from "./components/BulkActions";
import SearchFilterBar, {
  FilterField,
} from "../../components/shared/SearchFilterBar";

export default function OrdersPage() {
  const searchParams = useSearchParams();

  const clearSelection = () => setSelected([]);

  const page = Number(searchParams.get("page") || 1);

  const currentLimit = Number(searchParams.get("limit") || 10);

  const search = searchParams.get("search") || "";

  const paymentStatus = searchParams.get("paymentStatus") || "";
  const paymentMethod = searchParams.get("paymentMethod") || "";
  const deliveryStatus = searchParams.get("deliveryStatus") || "";

  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "newest";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  // STATES
  const [orders, setOrders] = useState<any[]>([]);

  const [pages, setPages] = useState(1);

  const [selected, setSelected] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);

  // FILTERS
  const filterFields: FilterField[] = [
    {
      key: "status",

      label: "Order Status",

      options: [
        {
          label: "Pending",
          value: "PENDING",
        },

        {
          label: "Confirmed",
          value: "CONFIRMED",
        },

        {
          label: "Packed",
          value: "PACKED",
        },

        {
          label: "Completed",
          value: "COMPLETED",
        },

        {
          label: "Cancelled",
          value: "CANCELLED",
        },
      ],
    },

    {
      key: "paymentStatus",

      label: "Payment Status",

      options: [
        {
          label: "Pending",
          value: "PENDING",
        },

        {
          label: "Paid",
          value: "PAID",
        },

        {
          label: "Failed",
          value: "FAILED",
        },

        {
          label: "Refunded",
          value: "REFUNDED",
        },
      ],
    },

    {
      key: "paymentMethod",

      label: "Payment Method",

      options: [
        {
          label: "COD",
          value: "COD",
        },

        {
          label: "ONLINE",
          value: "ONLINE",
        },

        {
          label: "UPI",
          value: "UPI",
        },

        {
          label: "CARD",
          value: "CARD",
        },
      ],
    },

    {
      key: "deliveryStatus",

      label: "Delivery Status",

      options: [
        {
          label: "Pending",
          value: "PENDING",
        },

        {
          label: "Packed",
          value: "PACKED",
        },

        {
          label: "Shipped",
          value: "SHIPPED",
        },

        {
          label: "Out For Delivery",
          value: "OUT_FOR_DELIVERY",
        },

        {
          label: "Delivered",
          value: "DELIVERED",
        },

        {
          label: "Failed",
          value: "FAILED",
        },
      ],
    },

    {
      key: "from",
      label: "From",
      type: "date",
    },

    {
      key: "to",
      label: "To",
      type: "date",
    },

    {
      key: "sort",

      label: "Sort",

      isSortEngine: true,

      options: [
        {
          label: "Newest First",
          value: "newest",
        },

        {
          label: "Oldest First",
          value: "oldest",
        },

        {
          label: "ID High-Low",
          value: "id_desc",
        },

        {
          label: "ID Low-High",
          value: "id_asc",
        },

        {
          label: "Highest Amount",
          value: "highest",
        },

        {
          label: "Lowest Amount",
          value: "lowest",
        },
      ],
    },
  ];

  // LOAD ORDERS
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadOrders();
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    page,
    currentLimit,
    search,
    status,
    paymentStatus,
    paymentMethod,
    deliveryStatus,
    sort,
    from,
    to,
  ]);

  async function loadOrders() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));

      params.set("limit", String(currentLimit));

      if (search) {
        params.set("search", search);
      }

      if (status) {
        params.set("status", status);
      }

      if (paymentStatus) {
        params.set("paymentStatus", paymentStatus);
      }

      if (paymentMethod) {
        params.set("paymentMethod", paymentMethod);
      }

      if (deliveryStatus) {
        params.set("deliveryStatus", deliveryStatus);
      }

      if (from) {
        params.set("from", from);
      }

      if (to) {
        params.set("to", to);
      }

      if (sort) {
        params.set("sort", sort);
      }

      const res = await fetch(`/api/orders?${params.toString()}`);

      const json = await res.json();

      setOrders(json.data || []);

      setPages(json.totalPages || 1);

      setSelected([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>

        <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-500">Current Results</p>

          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <SearchFilterBar
        globalSearchKey="search"
        globalSearchPlaceholder="Search by order ID, phone, shipping name, tracking ID..."
        fields={filterFields}
      />

      {/* BULK ACTIONS */}
      <BulkActions
        selected={selected}
        orders={orders}
        refresh={loadOrders}
        clearSelection={clearSelection}
      />

      {/* TABLE */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="text-gray-500 text-sm">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">No orders found</p>
          </div>
        ) : (
          <OrderTable
            orders={orders}
            selected={selected}
            setSelected={setSelected}
          />
        )}
      </div>

      {/* PAGINATION */}
      <Pagination
        title="Orders"
        page={page}
        totalPages={pages}
        currentLimit={currentLimit}
      />
    </div>
  );
}
