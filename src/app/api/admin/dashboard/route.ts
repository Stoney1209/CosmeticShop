import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all data in parallel
    const [
      // Sales today
      todayOrders,
      todayRevenue,
      
      // Sales this month
      monthOrders,
      monthRevenue,
      
      // Previous month
      prevMonthOrders,
      prevMonthRevenue,
      
      // Low stock
      lowStockCount,
      lowStockProducts,
      
      // Sales for chart (last 30 days)
      salesLast30Days,
      
      // Recent orders
      recentOrders,
      
      // Top products
      topProductsRaw,
    ] = await Promise.all([
      // Today stats
      prisma.order.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { in: ["COMPLETED", "CONFIRMED", "PROCESSING"] }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { in: ["COMPLETED", "CONFIRMED", "PROCESSING"] }
        },
        _sum: { totalAmount: true }
      }),
      
      // Month stats
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth },
          status: { in: ["COMPLETED", "CONFIRMED", "PROCESSING"] }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { in: ["COMPLETED", "CONFIRMED", "PROCESSING"] }
        },
        _sum: { totalAmount: true }
      }),
      
      // Previous month stats
      prisma.order.count({
        where: {
          createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth },
          status: { in: ["COMPLETED", "CONFIRMED", "PROCESSING"] }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth },
          status: { in: ["COMPLETED", "CONFIRMED", "PROCESSING"] }
        },
        _sum: { totalAmount: true }
      }),
      
      // Low stock
      prisma.product.count({
        where: {
          stock: { lte: prisma.product.fields.minStock },
          isActive: true
        }
      }),
      prisma.product.findMany({
        where: {
          stock: { lte: prisma.product.fields.minStock },
          isActive: true
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          minStock: true,
          mainImage: true,
        },
        take: 8,
        orderBy: { stock: 'asc' }
      }),
      
      // Chart data (last 30 days)
      prisma.order.findMany({
        where: {
          status: { in: ["COMPLETED", "CONFIRMED", "PROCESSING"] },
          createdAt: { gte: thirtyDaysAgo }
        },
        select: {
          createdAt: true,
          totalAmount: true
        },
        orderBy: { createdAt: 'asc' }
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        }
      }),
      
      // Top products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          subtotal: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      }),
    ]);

    // Get product details for top products
    const topProductIds = topProductsRaw.map(p => p.productId);
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, mainImage: true }
    });

    const topProducts = topProductsRaw.map(tp => ({
      ...tp,
      product: topProductDetails.find(p => p.id === tp.productId)
    }));

    // Calculate average ticket
    const totalRevenue = Number(monthRevenue._sum.totalAmount || 0);
    const avgTicket = monthOrders > 0 ? totalRevenue / monthOrders : 0;

    // Calculate changes
    const currentMonthRevenueNum = Number(monthRevenue._sum.totalAmount || 0);
    const previousMonthRevenueNum = Number(prevMonthRevenue._sum.totalAmount || 0);
    
    const revenueChange = previousMonthRevenueNum > 0 
      ? ((currentMonthRevenueNum - previousMonthRevenueNum) / previousMonthRevenueNum * 100)
      : 0;
    
    const ordersChange = prevMonthOrders > 0
      ? ((monthOrders - prevMonthOrders) / prevMonthOrders * 100)
      : 0;

    // Prepare chart data - group by day
    const chartDataMap = new Map();
    salesLast30Days.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      const existing = chartDataMap.get(date);
      if (existing) {
        existing.sales += Number(order.totalAmount);
        existing.orders += 1;
      } else {
        chartDataMap.set(date, { 
          date, 
          sales: Number(order.totalAmount),
          orders: 1 
        });
      }
    });
    
    const chartData = Array.from(chartDataMap.values());

    return NextResponse.json({
      salesToday: {
        amount: Number(todayRevenue._sum.totalAmount || 0),
        orders: todayOrders
      },
      salesMonth: {
        amount: currentMonthRevenueNum,
        orders: monthOrders
      },
      avgTicket,
      lowStockCount,
      lowStockProducts,
      chartData,
      recentOrders,
      topProducts,
      comparison: {
        revenueChange,
        ordersChange,
        currentMonthRevenue: currentMonthRevenueNum,
        previousMonthRevenue: previousMonthRevenueNum,
        currentMonthOrders: monthOrders,
        previousMonthOrders: prevMonthOrders,
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Error loading dashboard data" },
      { status: 500 }
    );
  }
}
