"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSubscribers() {
  try {
    return await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    throw new Error("Failed to fetch subscribers");
  }
}

export async function getSubscriberStats() {
  try {
    const total = await prisma.newsletterSubscriber.count();
    const active = await prisma.newsletterSubscriber.count({
      where: { isActive: true }
    });
    const recent = await prisma.newsletterSubscriber.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    return { total, active, recent };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { total: 0, active: 0, recent: 0 };
  }
}

export async function toggleSubscriberStatus(id: number, isActive: boolean) {
  try {
    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/newsletter");
    return { success: true };
  } catch (error) {
    console.error("Error toggling subscriber status:", error);
    return { success: false, error: "Error al actualizar estado" };
  }
}

export async function deleteSubscriber(id: number) {
  try {
    await prisma.newsletterSubscriber.delete({
      where: { id }
    });
    revalidatePath("/newsletter");
    return { success: true };
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return { success: false, error: "Error al eliminar suscriptor" };
  }
}

export async function exportSubscribers() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, createdAt: true }
    });

    const csv = [
      "Email,Date Subscribed",
      ...subscribers.map(s => `${s.email},${s.createdAt.toISOString()}`)
    ].join("\n");

    return { success: true, csv };
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    return { success: false, error: "Error al exportar suscriptores" };
  }
}
