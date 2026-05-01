"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminServerAuth } from "@/lib/server-auth";

export async function getInvoiceSettings() {
  await requireAdminServerAuth();
  try {
    const settings = await prisma.invoiceSetting.findFirst();
    return settings || null;
  } catch (error) {
    console.error("Error fetching invoice settings:", error);
    throw new Error("Failed to fetch invoice settings");
  }
}

export async function updateInvoiceSettings(data: {
  businessName: string;
  rfc: string;
  address: string;
  email: string;
  phone: string;
  taxRate: number;
}) {
  await requireAdminServerAuth();
  try {
    const existing = await prisma.invoiceSetting.findFirst();
    
    if (existing) {
      await prisma.invoiceSetting.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.invoiceSetting.create({
        data,
      });
    }

    revalidatePath("/admin/facturacion");
    return { success: true };
  } catch (error) {
    console.error("Error updating invoice settings:", error);
    return { success: false, error: "Error al actualizar configuración fiscal" };
  }
}

export async function createInvoice(orderId: number) {
  await requireAdminServerAuth();
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!order) {
      return { success: false, error: "Pedido no encontrado" };
    }

    const settings = await getInvoiceSettings();
    if (!settings) {
      return { success: false, error: "Configuración fiscal no encontrada" };
    }

    // Calculate subtotal from items
    const subtotal = order.items.reduce((sum: number, item: any) => sum + Number(item.subtotal), 0);
    const taxRate = 0.16;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Create invoice (without PAC integration for now)
    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        customerId: order.customerId,
        uuid: crypto.randomUUID(),
        folio: `FAC-${orderId}`,
        emitterRfc: settings.rfc,
        emitterName: settings.businessName,
        emitterAddress: settings.address,
        receptorRfc: "XAXX010101000", // Generic RFC for customers (should be collected from customer in future)
        receptorName: order.customerName,
        receptorEmail: order.customerEmail,
        receptorUse: "G03",
        subtotal,
        taxRate,
        taxAmount,
        total,
        paymentMethod: "PUE",
        paymentForm: "03",
        currency: "MXN",
        exchangeRate: 1,
      },
    });

    revalidatePath("/admin/facturacion");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true, invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: "Error al crear factura" };
  }
}

export async function getInvoices() {
  await requireAdminServerAuth();
  try {
    return await prisma.invoice.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new Error("Failed to fetch invoices");
  }
}
