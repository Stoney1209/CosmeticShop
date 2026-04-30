"use server";

import { prisma } from "@/lib/prisma";

export interface DashboardData {
  salesToday: { amount: number; orders: number };
  salesMonth: { amount: number; orders: number };
  avgTicket: number;
  lowStockCount: number;
  lowStockProducts: {
    id: number;
    name: string;
    sku: string;
    stock: number;
    minStock: number;
    mainImage: string | null;
  }[];
  chartData: { date: string; sales: number; orders: number }[];
  recentOrders: {
    id: number;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
  topProducts: {
    productId: number;
    _sum: { quantity: number; subtotal: number };
    product?: { id: number; name: string; mainImage: string | null };
  }[];
  comparison: {
    revenueChange: number;
    ordersChange: number;
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    currentMonthOrders: number;
    previousMonthOrders: number;
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const statusFilter = { in: ["COMPLETED" as const, "CONFIRMED" as const, "PROCESSING" as const] };

  const [
    todayOrders, todayRevenue,
    monthOrders, monthRevenue,
    prevMonthOrders, prevMonthRevenue,
    lowStockCount, lowStockProducts,
    salesLast30Days,
    recentOrders,
    topProductsRaw,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow }, status: statusFilter } }),
    prisma.order.aggregate({ where: { createdAt: { gte: today, lt: tomorrow }, status: statusFilter }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth }, status: statusFilter } }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, status: statusFilter }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth }, status: statusFilter } }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth }, status: statusFilter }, _sum: { totalAmount: true } }),
    prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
    prisma.product.findMany({ where: { stock: { lte: 5 }, isActive: true }, select: { id: true, name: true, sku: true, stock: true, minStock: true, mainImage: true }, take: 8, orderBy: { stock: "asc" } }),
    prisma.order.findMany({ where: { status: statusFilter, createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true, totalAmount: true }, orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, customerName: true, totalAmount: true, status: true, createdAt: true } }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true, subtotal: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
  ]);

  const topProductIds = topProductsRaw.map((p) => p.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, mainImage: true },
  });

  const topProducts = topProductsRaw.map((tp) => ({
    productId: tp.productId,
    _sum: { quantity: tp._sum.quantity || 0, subtotal: Number(tp._sum.subtotal || 0) },
    product: topProductDetails.find((p) => p.id === tp.productId),
  }));

  const currentMonthRevenueNum = Number(monthRevenue._sum.totalAmount || 0);
  const previousMonthRevenueNum = Number(prevMonthRevenue._sum.totalAmount || 0);
  const avgTicket = monthOrders > 0 ? currentMonthRevenueNum / monthOrders : 0;
  const revenueChange = previousMonthRevenueNum > 0 ? ((currentMonthRevenueNum - previousMonthRevenueNum) / previousMonthRevenueNum) * 100 : 0;
  const ordersChange = prevMonthOrders > 0 ? ((monthOrders - prevMonthOrders) / prevMonthOrders) * 100 : 0;

  const chartDataMap = new Map<string, { date: string; sales: number; orders: number }>();
  salesLast30Days.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
    const existing = chartDataMap.get(date);
    if (existing) {
      existing.sales += Number(order.totalAmount);
      existing.orders += 1;
    } else {
      chartDataMap.set(date, { date, sales: Number(order.totalAmount), orders: 1 });
    }
  });

  return {
    salesToday: { amount: Number(todayRevenue._sum.totalAmount || 0), orders: todayOrders },
    salesMonth: { amount: currentMonthRevenueNum, orders: monthOrders },
    avgTicket,
    lowStockCount,
    lowStockProducts,
    chartData: Array.from(chartDataMap.values()),
    recentOrders: recentOrders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt.toISOString(),
    })),
    topProducts,
    comparison: {
      revenueChange,
      ordersChange,
      currentMonthRevenue: currentMonthRevenueNum,
      previousMonthRevenue: previousMonthRevenueNum,
      currentMonthOrders: monthOrders,
      previousMonthOrders: prevMonthOrders,
    },
  };
}

/** U8: Order status translation map */
export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};
