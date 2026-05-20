"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Tags,
  BarChart3,
  CreditCard,
  FileText,
  LogOut,
  Import,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { ThemeProvider } from "./context/ThemeProvider";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItem = (path: string, label: string, Icon: any) => {
    const active = pathname.startsWith(path);

    return (
      <button
        onClick={() => router.push(path)}
        title={collapsed ? label : ""}
        className={`group relative flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
        ${
          active
            ? "bg-indigo-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        {/* Active Left Indicator */}
        {active && (
          <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full" />
        )}

        <Icon
          size={20}
          className={`transition ${
            active ? "text-white" : "text-gray-400 group-hover:text-gray-600"
          }`}
        />

        {!collapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Toaster position="top-right" />

        {/* ================= SIDEBAR ================= */}
        <aside
          className={`${
            collapsed ? "w-20" : "w-72"
          } bg-white/80 dark:bg-gray-800/80 backdrop-blur border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-4">
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-indigo-600 tracking-wide">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </button>
          </div>

          {/* NAVIGATION (SCROLLABLE) */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {navItem("/dashboard", "Dashboard", LayoutDashboard)}
            {navItem("/dashboard/products", "Products", Package)}
            {navItem("/dashboard/orders", "Orders", ShoppingCart)}
            {navItem("/dashboard/inventory", "Inventory", Boxes)}
            {navItem("/dashboard/user", "Users", Users)}
            {navItem("/dashboard/category", "Category", Tags)}
            {navItem("/dashboard/payment", "Payments", CreditCard)}
            {navItem("/dashboard/admin-log", "Admin Logs", FileText)}
            {navItem("/dashboard/analytics", "Analytics", BarChart3)}
            {navItem("/dashboard/Import", "Import File", Import)}
          </nav>

          {/* FOOTER */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut size={18} />
              {!collapsed && "Logout"}
            </button>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <div className="flex-1 flex flex-col">
          {/* HEADER */}
          <header className="sticky top-0 z-10 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
            {/* SEARCH */}
            <div className="relative w-80">
              <input
                placeholder="Search anything..."
                className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-4">
              {/* Notification */}
              <div className="relative">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 cursor-pointer hover:scale-105 transition">
                  🔔
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-semibold shadow-md">
                A
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="flex-1 overflow-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm min-h-full transition">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}