"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderTable from "./components/OrderTable";
import OrderFilters from "./components/OrderFilters";
import Pagination from "../components/Pagination";
import BulkActions from "./components/BulkActions";

export default function OrdersPage() {
  
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const currentLimit = Number(searchParams.get("limit") || 10);
  const [orders, setOrders] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [filters, setFilters] = useState({search: "",status: "",});
  const [loading, setLoading] = useState(false);

  async function loadOrders() {
    setLoading(true);

    const query = new URLSearchParams({
      page: String(page),
      limit: String(currentLimit),
      search: filters.search,
      status: filters.status,
    });

    const res = await fetch(`/api/orders?${query}`);
    const data = await res.json();

    setOrders(data.orders);
    setPages(data.pages);
    setSelected([]);

    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, [page, currentLimit, filters]);

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
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <OrderFilters setFilters={setFilters} />
      </div>

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
