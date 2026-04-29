"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCustomerSession } from "@/lib/customer-session";
import { sendEmail, generateOrderConfirmationEmail, generateAdminOrderNotificationEmail, generateOrderStatusUpdateEmail } from "@/lib/email";

export async function getOrders() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  discountAmount?: number;
  couponCode?: string;
  items: { 
    productId: number; 
    productVariantId?: number;
    productName: string; 
    productSku: string; 
    variantLabel?: string;
    quantity: number; 
    unitPrice: number; 
    subtotal: number 
  }[];
  totalAmount: number;
}) {
  try {
    const session = await getCustomerSession();

    // Validaciones server-side antes de crear el pedido
    for (const item of data.items) {
      // Validar que el producto existe y está activo
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: item.productVariantId ? {
            where: { id: item.productVariantId, isActive: true }
          } : undefined
        }
      });

      if (!product || !product.isActive) {
        return { success: false, error: `El producto ${item.productName} no está disponible` };
      }

      // Validar stock suficiente
      if (product.stock < item.quantity) {
        return { success: false, error: `Stock insuficiente para ${item.productName}` };
      }

      // Validar variante si existe
      if (item.productVariantId) {
        const variant = product.variants?.[0];
        if (!variant) {
          return { success: false, error: `La variante seleccionada no está disponible` };
        }
        if (variant.stock < item.quantity) {
          return { success: false, error: `Stock insuficiente para la variante de ${item.productName}` };
        }
        // Validar precio de variante si tiene precio específico
        if (variant.price && Number(variant.price) !== item.unitPrice) {
          return { success: false, error: `El precio de ${item.productName} ha cambiado` };
        }
      } else {
        // Validar precio del producto
        if (Number(product.price) !== item.unitPrice) {
          return { success: false, error: `El precio de ${item.productName} ha cambiado` };
        }
      }

      // Validar cálculo de subtotal
      const expectedSubtotal = item.quantity * item.unitPrice;
      if (Math.abs(expectedSubtotal - item.subtotal) > 0.01) {
        return { success: false, error: `Error en el cálculo del subtotal para ${item.productName}` };
      }
    }

    // Validar cupón si se proporciona
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase(), isActive: true }
      });

      if (!coupon) {
        return { success: false, error: "Cupón no válido" };
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return { success: false, error: "Cupón expirado" };
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { success: false, error: "Cupón agotado" };
      }

      if (coupon.minAmount && data.totalAmount < Number(coupon.minAmount)) {
        return { success: false, error: `Compra mínima de $${Number(coupon.minAmount).toFixed(2)} requerida` };
      }
    }

    // Validar cálculo total
    const calculatedTotal = data.items.reduce((sum, item) => sum + item.subtotal, 0) - (data.discountAmount || 0);
    if (Math.abs(calculatedTotal - data.totalAmount) > 0.01) {
      return { success: false, error: "Error en el cálculo del total" };
    }

    // Generate order number
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const count = await prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } });
    const orderNumber = `ORD-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const order = await prisma.$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: session?.id,
          customerName: data.customerName,
          customerEmail: session?.email,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          totalAmount: data.totalAmount,
          discountAmount: data.discountAmount || 0,
          couponCode: data.couponCode || null,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              productName: item.variantLabel ? `${item.productName} (${item.variantLabel})` : item.productName,
              productSku: item.productSku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal
            }))
          }
        },
        include: { items: true }
      });

      // Update stock
      for (const item of data.items) {
        // Decrement main product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        // Decrement variant stock if exists
        if (item.productVariantId) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // Increment coupon usage count if applicable
      if (data.couponCode) {
        await tx.coupon.update({
          where: { code: data.couponCode.toUpperCase() },
          data: { usageCount: { increment: 1 } }
        });
      }

      return newOrder;
    });

    revalidatePath("/pedidos");
    revalidatePath("/inventario");
    revalidatePath("/mis-pedidos");

    // Send confirmation emails (non-blocking)
    try {
      // Send to customer
      if (session?.email) {
        const { subject, html, text } = generateOrderConfirmationEmail(orderNumber, data.totalAmount);
        await sendEmail({ to: session.email, subject, html, text });
      }

      // Send to admin (get from settings or use default)
      const adminEmail = process.env.ADMIN_EMAIL || "admin@cosmeticsshop.com";
      const { subject: adminSubject, html: adminHtml, text: adminText } = generateAdminOrderNotificationEmail(
        orderNumber,
        data.totalAmount,
        data.customerName,
        data.items.map(item => ({ name: item.productName, quantity: item.quantity, price: item.unitPrice }))
      );
      await sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml, text: adminText });
    } catch (emailError) {
      console.error("Error sending order emails:", emailError);
      // Don't fail the order if email fails
    }

    return { success: true, order };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Error al crear el pedido" };
  }
}

export async function updateOrderStatus(id: number, status: "PENDING" | "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED") {
  try {
    const order = await prisma.$transaction(async (tx: any) => {
      const currentOrder = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!currentOrder) throw new Error("Order not found");

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status }
      });

      // If cancelled, restore stock
      if (status === "CANCELLED" && currentOrder.status !== "CANCELLED") {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
          
          if (item.productVariantId) {
            await tx.productVariant.update({
              where: { id: item.productVariantId },
              data: { stock: { increment: item.quantity } }
            });
          }
        }
      }

      // If restoring from cancelled
      if (currentOrder.status === "CANCELLED" && status !== "CANCELLED") {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });

          if (item.productVariantId) {
            await tx.productVariant.update({
              where: { id: item.productVariantId },
              data: { stock: { decrement: item.quantity } }
            });
          }
        }
      }

      return updatedOrder;
    });

    // Send status update email to customer
    try {
      if (order.customerEmail) {
        const { subject, html, text } = generateOrderStatusUpdateEmail(order.orderNumber, status, order.customerName);
        await sendEmail({ to: order.customerEmail, subject, html, text });
      }
    } catch (emailError) {
      console.error("Error sending status update email:", emailError);
    }

    revalidatePath("/pedidos");
    revalidatePath("/inventario");
    return { success: true, order };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Error al actualizar estado" };
  }
}
