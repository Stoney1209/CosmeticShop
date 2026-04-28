"use server";
import { prisma } from "@/lib/prisma";

export async function getReportsData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentOrders = await prisma.order.findMany({
    where: { 
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ["COMPLETED", "CONFIRMED"] }
    },
    select: { createdAt: true, totalAmount: true }
  });

  const bestSellers = await prisma.orderItem.groupBy({
    by: ['productId', 'productName'],
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10
  });

  return { recentOrders, bestSellers };
}
