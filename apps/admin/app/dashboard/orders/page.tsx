"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderTable from "./components/OrderTable";
import Pagination from "../components/Pagination";
import BulkActions from "./components/BulkActions";
import SearchFilterBar, { FilterField } from "../components/SearchFilterBar";

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const currentLimit = Number(searchParams.get("limit") || 10);
  const search =
    searchParams.get("search") || "";

  const status =
    searchParams.get("status") || "";

  const sort =
    searchParams.get("sort") ||
    "newest";

   // STATES 
  const [orders, setOrders] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const filterFields: FilterField[] = [
    {
      key: "status",

      label: "Status",

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
          label: "Shipped",
          value: "SHIPPED",
        },

        {
          label: "Delivered",
          value: "DELIVERED",
        },

        {
          label: "Cancelled",
          value: "CANCELLED",
        },
      ],
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
    sort,
  ]);

  async function loadOrders() {
    try {
      setLoading(true);

      const params =
        new URLSearchParams();

      params.set(
        "page",
        String(page)
      );

      params.set(
        "limit",
        String(currentLimit)
      );

      if (search) {
        params.set("search", search);
      }

      if (status) {
        params.set("status", status);
      }

      if (sort) {
        params.set("sort", sort);
      }

      const res = await fetch(
        `/api/orders?${params.toString()}`
      );

      const json = await res.json();

      setOrders(json.data || []);

      setPages(
        json.totalPages || 1
      );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-500">
            Manage and track all customer orders
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* FILTER CARD */}
      <SearchFilterBar
          globalSearchKey="search"
          globalSearchPlaceholder="Search orders..."
          fields={filterFields}
        />

      {/* BULK ACTIONS */}
      <BulkActions selected={selected} orders={orders} refresh={loadOrders} />

      {/* TABLE CARD */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No orders found</div>
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
