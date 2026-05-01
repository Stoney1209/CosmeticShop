"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail, generateAbandonedCartEmail } from "@/lib/email";
import { requireAdminServerAuth } from "@/lib/server-auth";

export async function getAbandonedCarts() {
  await requireAdminServerAuth();
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
  await requireAdminServerAuth();
  try {
    const cart = await prisma.abandonedCart.findUnique({
      where: { id: cartId },
      include: { customer: true },
    });

    if (!cart) {
      return { success: false, error: "Carrito no encontrado" };
    }

    if (!cart.customer?.email) {
      return { success: false, error: "El cliente no tiene email registrado" };
    }

    // Parse cart data to get items
    const cartItems = cart.cartData as Array<{ productId: number; quantity: number; price: number }> || [];
    
    // Fetch product details for the email
    const productIds = cartItems.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });

    const itemsWithNames = cartItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        name: product?.name || "Producto",
        price: item.price,
      };
    });

    // Generate recovery URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cartUrl = `${appUrl}/tienda`;

    // Send recovery email
    const { subject, html, text } = generateAbandonedCartEmail(
      cart.customer.fullName,
      cartUrl,
      itemsWithNames
    );
    
    const emailResult = await sendEmail({
      to: cart.customer.email,
      subject,
      html,
      text,
    });

    if (!emailResult.success) {
      return { success: false, error: "Error al enviar el correo de recuperación" };
    }

    // Mark as notified
    await prisma.abandonedCart.update({
      where: { id: cartId },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    revalidatePath("/admin/carritos-abandonados");
    return { success: true, message: "Correo de recuperación enviado exitosamente" };
  } catch (error) {
    console.error("Error sending recovery email:", error);
    return { success: false, error: "Error al enviar correo de recuperación" };
  }
}

export async function clearAbandonedCart(customerId: number) {
  await requireAdminServerAuth();
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
