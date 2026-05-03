"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface Notification {
  id: number;
  type: string; // "order" | "stock" | "system" | "alert" | "payment"
  title: string;
  message: string;
  link?: string | null;
  createdAt: Date;
  isRead: boolean;
}

export interface NotificationsSummary {
  unreadCount: number;
  notifications: Notification[];
}

export async function getNotifications(): Promise<NotificationsSummary> {
  // P3: Fetch last 10 notifications from DB
  const notifications = await prisma.notification.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = await prisma.notification.count({
    where: { isRead: false },
  });

  return {
    unreadCount,
    notifications: notifications.map(n => ({
      ...n,
      id: n.id,
      createdAt: n.createdAt,
    })),
  };
}

export async function markAsRead(id: number) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false };
  }
}

export async function markAllAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false };
  }
}

// Helper to create notifications from other actions
export async function createNotification(data: {
  type: "order" | "stock" | "system" | "alert" | "payment";
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        ...data,
        isRead: false,
      },
    });
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
