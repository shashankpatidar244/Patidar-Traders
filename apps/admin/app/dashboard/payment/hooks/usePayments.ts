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
  const [data, setData] = useState<any[]>([]);

  const [meta, setMeta] =
    useState<PaymentMeta>({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

  const [loading, setLoading] =
    useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const params =
        new URLSearchParams();

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

      const res = await fetch(
        `/api/payment?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      setData(json.data || []);

      setMeta({
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 10,
        totalPages:
          json.totalPages || 1,
      });
    } catch (error) {
      console.error(
        "PAYMENTS FETCH ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    // AUTO REFRESH
    const interval = setInterval(() => {
      fetchPayments();
    }, 60000);

    return () => clearInterval(interval);
  }, [
    search,
    status,
    method,
    sort,
    page,
    limit,
  ]);

  return {
    data,
    meta,
    loading,
    refetch: fetchPayments,
  };
}