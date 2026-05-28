"use client";

import { useEffect, useState } from "react";

interface UsePaymentsParams {
  search: string;
  status: string;
  method: string;
  sort: string;
  page: number;
  limit: number;
}

export interface PaymentItem {
  id: number;

  quantity: number;

  price: number;

  product: {
    id: number;
    name: string;
  };

  variant?: {
    id: number;
    name: string;
    value: string;
    unit?: string;
  } | null;
}

export interface PaymentUser {
  id: number;
  username?: string | null;
  phone: string;
}

export interface PaymentOrder {
  id: number;

  total: number;

  status: "PENDING" | "CONFIRMED" | "PACKED" | "COMPLETED" | "CANCELLED";

  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";

  paymentMethod: "COD" | "UPI" | "CARD";

  deliveryStatus:
    | "PENDING"
    | "PACKED"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED";

  razorpayOrderId?: string | null;

  razorpayPaymentId?: string | null;

  razorpaySignature?: string | null;

  trackingId?: string | null;

  paidAt?: string | null;

  expiresAt?: string | null;

  shippingName: string;

  shippingPhone: string;

  shippingLine1: string;

  shippingLine2?: string | null;

  shippingCity: string;

  shippingState: string;

  shippingPincode: string;

  createdAt: string;

  updatedAt: string;

  user: PaymentUser;

  items: PaymentItem[];
}

interface PaymentMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePayments({
  search,
  status,
  method,
  sort,
  page,
  limit,
}: UsePaymentsParams) {
  const [data, setData] = useState<PaymentOrder[]>([]);

  const [meta, setMeta] = useState<PaymentMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      /* FILTERS */
      if (search) {
        params.set("search", search);
      }

      if (status) {
        params.set("status", status);
      }

      if (method) {
        params.set("method", method);
      }

      if (sort) {
        params.set("sort", sort);
      }

      params.set("page", String(page));

      params.set("limit", String(limit));

      const res = await fetch(`/api/payment?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch payments");
      }

      const json = await res.json();

      /* DECIMAL FIX */
      const formattedData = (json.data || []).map((order: any) => ({
        ...order,

        total: Number(order.total),

        items:
          order.items?.map((item: any) => ({
            ...item,
            price: Number(item.price),
          })) || [],
      }));

      setData(formattedData);

      setMeta({
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 10,
        totalPages: json.totalPages || 1,
      });
    } catch (error) {
      console.error("PAYMENTS FETCH ERROR:", error);

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    /* AUTO REFRESH */
    const interval = setInterval(() => {
      fetchPayments();
    }, 60000);

    return () => clearInterval(interval);
  }, [search, status, method, sort, page, limit]);

  return {
    data,
    meta,
    loading,
    refetch: fetchPayments,
  };
}
