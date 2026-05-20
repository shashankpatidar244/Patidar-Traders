import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ===============================
    // QUERY PARAMS
    // ===============================
    const range = searchParams.get("range") || "7d";
    const category = searchParams.get("category");
    const paymentMethod = searchParams.get("paymentMethod");
    const status = searchParams.get("status");

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // ===============================
    // DATE RANGE LOGIC
    // ===============================
    let currentStart = new Date();

    if (range === "30d") {
      currentStart.setDate(currentStart.getDate() - 30);
    } else if (range === "custom" && startDateParam) {
      currentStart = new Date(startDateParam);
    } else {
      currentStart.setDate(currentStart.getDate() - 7);
    }

    const currentEnd = endDateParam ? new Date(endDateParam) : new Date();

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 7);

    // ===============================
    // BASE FILTER (REUSABLE)
    // ===============================
    const baseWhere: any = {
      createdAt: {
        gte: currentStart,
        lte: currentEnd,
      },
    };

    if (paymentMethod) baseWhere.paymentMethod = paymentMethod;
    if (status) baseWhere.status = status;

    // ===============================
    // BASIC COUNTS
    // ===============================
    const [totalOrders, totalUsers] = await Promise.all([
      prisma.order.count({ where: baseWhere }),
      prisma.user.count(),
    ]);

    // ===============================
    // REVENUE
    // ===============================
    const [currentRevenueAgg, previousRevenueAgg] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...baseWhere,
          paymentStatus: "PAID",
        },
        _sum: { total: true },
      }),

      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: previousStart,
            lt: currentStart,
          },
        },
        _sum: { total: true },
      }),
    ]);

    const currentRevenue = currentRevenueAgg._sum?.total ?? 0;
    const previousRevenue = previousRevenueAgg._sum?.total ?? 0;

    const revenueGrowth =
      previousRevenue === 0
        ? 0
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // ===============================
    // CHART DATA
    // ===============================
    const grouped = await prisma.order.groupBy({
      by: ["createdAt"],
      where: baseWhere,
      _count: true,
      _sum: { total: true },
      orderBy: { createdAt: "asc" },
    });

    const revenueChart = grouped.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      revenue: item._sum?.total ?? 0,
    }));

    const ordersChart = grouped.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      orders: item._count,
    }));

    // ===============================
    // TOP PRODUCTS + CATEGORY FILTER
    // ===============================
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: baseWhere,
      },
      select: {
        quantity: true,
        productId: true,
        product: {
          select: {
            name: true,
            category: {
              select: { name: true },
            },
          },
        },
      },
    });

    const productMap: Record<string, any> = {};

    orderItems.forEach((item) => {
      const categoryName = item.product?.category?.name || "Unknown";

      // APPLY CATEGORY FILTER
      if (category && category !== categoryName) return;

      const key = item.productId;

      if (!productMap[key]) {
        productMap[key] = {
          name: item.product.name,
          quantity: 0,
          category: categoryName,
        };
      }

      productMap[key].quantity += item.quantity;
    });

    const topProducts = Object.values(productMap)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 5);

    // ===============================
    // TOP CATEGORIES
    // ===============================
    const categoryMap: Record<string, number> = {};

    orderItems.forEach((item) => {
      const name = item.product?.category?.name || "Unknown";

      if (category && category !== name) return;

      categoryMap[name] = (categoryMap[name] || 0) + item.quantity;
    });

    const topCategories = Object.entries(categoryMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // ===============================
    // PAYMENT METHODS
    // ===============================
    const paymentMethodsRaw = await prisma.order.groupBy({
      by: ["paymentMethod"],
      where: baseWhere,
      _count: true,
    });

    const paymentMethods = paymentMethodsRaw.map((p) => ({
      method: p.paymentMethod,
      count: p._count,
    }));

    // ===============================
    // EXTRA INSIGHTS
    // ===============================
    const [pendingOrders, cancelledOrders, lowStock, outOfStock] =
      await Promise.all([
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "CANCELLED" } }),
        prisma.productVariant.count({
          where: { stock: { lt: 5 } },
        }),
        prisma.productVariant.count({
          where: { stock: 0 },
        }),
      ]);

    // ===============================
    // AI INSIGHTS
    // ===============================
    const insights: string[] = [];

    if (revenueGrowth > 20) {
      insights.push(`🚀 Revenue up ${revenueGrowth.toFixed(1)}%`);
    } else if (revenueGrowth < -10) {
      insights.push(
        `⚠️ Revenue dropped ${Math.abs(revenueGrowth).toFixed(1)}%`
      );
    }

    const conversion = totalUsers === 0 ? 0 : (totalOrders / totalUsers) * 100;

    if (conversion < 2) {
      insights.push("⚠️ Low conversion rate");
    } else if (conversion > 5) {
      insights.push("🔥 Strong conversion rate");
    }

    const topCategory = topCategories[0];

    if (topCategory?.name) {
      insights.push(`🏆 Top category: ${topCategory.name}`);
    }

    if (lowStock > 0) {
      insights.push(`⚠️ ${lowStock} low stock variants`);
    }

    if (outOfStock > 0) {
      insights.push(`❌ ${outOfStock} out of stock`);
    }

    // ===============================
    // RESPONSE
    // ===============================
    return NextResponse.json({
      revenue: currentRevenue,
      revenueGrowth,

      totalOrders,
      totalUsers,
      conversionRate: conversion,

      revenueChart,
      ordersChart,

      topProducts,
      topCategories,
      paymentMethods,

      pendingOrders,
      cancelledOrders,
      lowStock,
      outOfStock,

      insights,
    });
  } catch (error) {
    console.error("Analytics Error:", error);

    return NextResponse.json({ error: "Analytics failed" }, { status: 500 });
  }
}
