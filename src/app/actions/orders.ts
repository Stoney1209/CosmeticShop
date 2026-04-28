"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    // Generate order number
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const count = await prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } });
    const orderNumber = `ORD-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          totalAmount: data.totalAmount,
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

      return newOrder;
    });

    revalidatePath("/pedidos");
    revalidatePath("/inventario");
    return { success: true, order };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Error al crear el pedido" };
  }
}

export async function updateOrderStatus(id: number, status: "PENDING" | "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED") {
  try {
    const order = await prisma.$transaction(async (tx) => {
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

    revalidatePath("/pedidos");
    revalidatePath("/inventario");
    return { success: true, order };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Error al actualizar estado" };
  }
}
