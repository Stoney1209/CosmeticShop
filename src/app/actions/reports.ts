"use server";
import { prisma } from "@/lib/prisma";

export async function getReportsData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  // Recent orders for revenue chart
  const recentOrders = await prisma.order.findMany({
    where: { 
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ["COMPLETED", "CONFIRMED"] }
    },
    select: { createdAt: true, totalAmount: true }
  });

  // Best sellers
  const bestSellers = await prisma.orderItem.groupBy({
    by: ['productId', 'productName'],
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10
  });

  // Today's stats
  const todayOrders = await prisma.order.count({
    where: { createdAt: { gte: today } }
  });

  const todayRevenue = await prisma.order.aggregate({
    where: { 
      createdAt: { gte: today },
      status: { in: ["COMPLETED", "CONFIRMED"] }
    },
    _sum: { totalAmount: true }
  });

  // This month's stats
  const monthOrders = await prisma.order.count({
    where: { createdAt: { gte: thisMonth } }
  });

  const monthRevenue = await prisma.order.aggregate({
    where: { 
      createdAt: { gte: thisMonth },
      status: { in: ["COMPLETED", "CONFIRMED"] }
    },
    _sum: { totalAmount: true }
  });

  // Total customers
  const totalCustomers = await prisma.customer.count();

  // Total products
  const totalProducts = await prisma.product.count({ where: { isActive: true } });

  // Low stock products
  const lowStockProducts = await prisma.product.count({
    where: { 
      isActive: true,
      stock: { lte: 5 }
    }
  });

  // Orders by status
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { totalAmount: true }
  });

  // Recent customers
  const recentCustomers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
      _count: {
        select: { orders: true }
      }
    }
  });

  // Non-rotating products (products with no sales in the last 30 days)
  const nonRotatingProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      createdAt: { lte: thirtyDaysAgo },
      orderItems: {
        none: {
          order: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      price: true,
      mainImage: true,
      category: {
        select: {
          name: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return { 
    recentOrders, 
    bestSellers,
    today: {
      orders: todayOrders,
      revenue: todayRevenue._sum.totalAmount || 0
    },
    month: {
      orders: monthOrders,
      revenue: monthRevenue._sum.totalAmount || 0
    },
    totals: {
      customers: totalCustomers,
      products: totalProducts,
      lowStock: lowStockProducts
    },
    ordersByStatus,
    recentCustomers,
    nonRotatingProducts
  };
}
