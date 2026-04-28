"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getActivityLogs(limit = 100) {
  try {
    return await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  } catch (error: any) {
    console.error("Error fetching activity logs:", error);
    // Return empty array if table doesn't exist
    if (error.code === "P2021") {
      return [];
    }
    throw new Error("Failed to fetch activity logs");
  }
}

export async function logActivity(data: {
  action: string;
  entityType?: string;
  entityId?: number;
  description?: string;
  userId?: number;
}) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || 
                     headersList.get("x-real-ip") || 
                     "unknown";

    await prisma.activityLog.create({
      data: {
        action: data.action,
        entityType: data.entityType || "",
        entityId: data.entityId,
        description: data.description,
        userId: data.userId,
        ipAddress,
      },
    });

    revalidatePath("/admin/actividad");
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw error to avoid breaking the main operation
  }
}

export async function clearActivityLogs() {
  try {
    await prisma.activityLog.deleteMany({});

    revalidatePath("/admin/actividad");
    return { success: true };
  } catch (error) {
    console.error("Error clearing activity logs:", error);
    return { success: false, error: "Error al limpiar logs de actividad" };
  }
}

export async function getActivityLogsByEntity(entityType: string, entityId: number) {
  try {
    return await prisma.activityLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs by entity:", error);
    throw new Error("Failed to fetch activity logs by entity");
  }
}
