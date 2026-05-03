"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface AppNotification {
  id: number;
  type: string; // "order" | "stock" | "system" | "alert" | "payment"
  title: string;
  message: string;
  link?: string | null;
  createdAt: string; // ISO String for serialization
  isRead: boolean;
}

export interface NotificationsSummary {
  unreadCount: number;
  notifications: AppNotification[];
}

export async function getNotifications(): Promise<NotificationsSummary> {
  try {
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
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return {
      unreadCount: 0,
      notifications: [],
    };
  }
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
