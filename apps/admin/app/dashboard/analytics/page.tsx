"use client";

import { useAnalytics } from "./hooks/useAnalytics";
import KpiCard from "./components/KpiCard";
import RevenueChart from "./components/RevenueChart";
import OrdersChart from "./components/OrdersChart";
import TopProducts from "./components/TopProducts";
import PaymentPie from "./components/PaymentPie";
import Insights from "./components/Insights";
import TopCategoriesChart from "./components/TopCategoriesChart";
import AIInsights from "./components/AIInsights";
import Loading from "./loading";
import { useState } from "react";

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d");

  const [activeMetric, setActiveMetric] = useState<
    "all" | "revenue" | "orders" | "users" | "conversion"
  >("all");

  // ADVANCED FILTER STATE
  const [filters, setFilters] = useState<{
    date?: string;
    category?: string;
    paymentMethod?: string;
    orderStatus?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const { data, loading, error } = useAnalytics(range);

  if (loading) return <Loading />;

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!data) return null;

  // =============================
  // FILTER LOGIC (FRONTEND)
  // =============================
  const filteredProducts = (data.topProducts || []).filter((p: any) => {
    if (filters.category && p.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4">

        {/* Title + Controls */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Monitor performance, revenue and growth
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {activeMetric !== "all" && (
              <button
                onClick={() => setActiveMetric("all")}
                className="text-sm text-indigo-600 hover:underline"
              >
                Reset Metric
              </button>
            )}

            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => setFilters({})}
                className="text-sm text-red-500 hover:underline"
              >
                Clear Filters
              </button>
            )}

            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border px-4 py-2 rounded-lg bg-white shadow-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* ================= ADVANCED FILTERS ================= */}
        <div className="bg-white p-4 rounded-xl shadow grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* Custom Date */}
          {range === "custom" && (
            <>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, startDate: e.target.value }))
                }
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, endDate: e.target.value }))
                }
                className="border rounded-lg px-3 py-2"
              />
            </>
          )}

          {/* Category */}
          <select
            onChange={(e) =>
              setFilters((p) => ({ ...p, category: e.target.value }))
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            {data.topCategories?.map((c: any) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Payment */}
          <select
            onChange={(e) =>
              setFilters((p) => ({ ...p, paymentMethod: e.target.value }))
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Payments</option>
            <option value="COD">COD</option>
            <option value="ONLINE">ONLINE</option>
          </select>

          {/* Order Status */}
          <select
            onChange={(e) =>
              setFilters((p) => ({ ...p, orderStatus: e.target.value }))
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ================= ACTIVE FILTER CHIPS ================= */}
      {Object.entries(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, val]) =>
            val ? (
              <span
                key={key}
                className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs"
              >
                {key}: {val}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* ================= AI INSIGHTS ================= */}
      <AIInsights data={data.insights || []} />

      {/* ================= KPI ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div onClick={() => setActiveMetric("revenue")}>
          <KpiCard
            title="Revenue"
            value={`₹${data.revenue.toLocaleString()}`}
            growth={data.revenueGrowth}
            active={activeMetric === "revenue"}
          />
        </div>

        <div onClick={() => setActiveMetric("orders")}>
          <KpiCard
            title="Orders"
            value={data.totalOrders}
            active={activeMetric === "orders"}
          />
        </div>

        <div onClick={() => setActiveMetric("users")}>
          <KpiCard
            title="Users"
            value={data.totalUsers}
            active={activeMetric === "users"}
          />
        </div>

        <div onClick={() => setActiveMetric("conversion")}>
          <KpiCard
            title="Conversion"
            value={`${data.conversionRate.toFixed(2)}%`}
            active={activeMetric === "conversion"}
          />
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {(activeMetric === "all" || activeMetric === "revenue") && (
          <RevenueChart data={data.revenueChart} />
        )}

        {(activeMetric === "all" || activeMetric === "orders") && (
          <OrdersChart data={data.ordersChart} />
        )}
      </div>

      {/* ================= SECOND ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <TopCategoriesChart data={data.topCategories || []} />
        <PaymentPie data={data.paymentMethods} />
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <TopProducts data={filteredProducts} />
        <Insights data={data} />
      </div>

    </div>
  );
}