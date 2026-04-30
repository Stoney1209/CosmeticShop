"use server";

import { prisma } from "@/lib/prisma";

export interface Notification {
  id: string;
  type: "order" | "stock" | "alert";
  title: string;
  message: string;
  link?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface NotificationsSummary {
  unreadCount: number;
  notifications: Notification[];
}

export async function getNotifications(): Promise<NotificationsSummary> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Pedidos pendientes de hoy
  const pendingOrders = await prisma.order.count({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  // 2. Productos con stock bajo
  const lowStockCount = await prisma.product.count({
    where: {
      stock: { lte: 5 },
      isActive: true,
    },
  });

  // 3. Pedidos urgentes (más de 24h pendientes)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const urgentOrders = await prisma.order.count({
    where: {
      status: "PENDING",
      createdAt: { lt: yesterday },
    },
  });

  const notifications: Notification[] = [];

  if (pendingOrders > 0) {
    notifications.push({
      id: "new-orders-today",
      type: "order",
      title: "Nuevos pedidos hoy",
      message: `${pendingOrders} pedido${pendingOrders > 1 ? "s" : ""} pendiente${pendingOrders > 1 ? "s" : ""} de confirmar`,
      link: "/pedidos",
      createdAt: now,
      isRead: false,
    });
  }

  if (urgentOrders > 0) {
    notifications.push({
      id: "urgent-orders",
      type: "alert",
      title: "Pedidos urgentes",
      message: `${urgentOrders} pedido${urgentOrders > 1 ? "s" : ""} con más de 24h sin procesar`,
      link: "/pedidos",
      createdAt: now,
      isRead: false,
    });
  }

  if (lowStockCount > 0) {
    notifications.push({
      id: "low-stock",
      type: "stock",
      title: "Stock bajo",
      message: `${lowStockCount} producto${lowStockCount > 1 ? "s" : ""} necesita${lowStockCount === 1 ? "" : "n"} reabastecimiento`,
      link: "/inventario",
      createdAt: now,
      isRead: false,
    });
  }

  // Ordenar por fecha (más recientes primero)
  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    unreadCount: notifications.length,
    notifications,
  };
}
