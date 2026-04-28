"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAbandonedCarts() {
  try {
    return await prisma.abandonedCart.findMany({
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching abandoned carts:", error);
    throw new Error("Failed to fetch abandoned carts");
  }
}

export async function trackAbandonedCart(data: {
  customerId: number;
  items: Array<{ productId: number; quantity: number; price: number }>;
  totalAmount: number;
}) {
  try {
    const existing = await prisma.abandonedCart.findFirst({
      where: { customerId: data.customerId },
    });

    if (existing) {
      await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: {
          cartData: data.items,
          totalAmount: data.totalAmount,
        },
      });
    } else {
      await prisma.abandonedCart.create({
        data: {
          customerId: data.customerId,
          cartData: data.items,
          totalAmount: data.totalAmount,
        },
      });
    }

    revalidatePath("/admin/carritos-abandonados");
    return { success: true };
  } catch (error) {
    console.error("Error tracking abandoned cart:", error);
    return { success: false, error: "Error al rastrear carrito" };
  }
}

export async function sendRecoveryEmail(cartId: number) {
  try {
    const cart = await prisma.abandonedCart.findUnique({
      where: { id: cartId },
      include: { customer: true },
    });

    if (!cart) {
      return { success: false, error: "Carrito no encontrado" };
    }

    // In a real implementation, you would send an email here
    // For now, we'll just mark it as notified
    await prisma.abandonedCart.update({
      where: { id: cartId },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    revalidatePath("/admin/carritos-abandonados");
    return { success: true };
  } catch (error) {
    console.error("Error sending recovery email:", error);
    return { success: false, error: "Error al enviar correo de recuperación" };
  }
}

export async function clearAbandonedCart(customerId: number) {
  try {
    await prisma.abandonedCart.deleteMany({
      where: { customerId },
    });

    revalidatePath("/admin/carritos-abandonados");
    return { success: true };
  } catch (error) {
    console.error("Error clearing abandoned cart:", error);
    return { success: false, error: "Error al limpiar carrito" };
  }
}
