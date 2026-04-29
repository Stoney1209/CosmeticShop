/**
 * Servicio de WhatsApp para notificaciones automáticas
 */

interface WhatsAppOrderData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  notes?: string;
}

/**
 * Genera el mensaje de WhatsApp para el cliente con los detalles del pedido
 */
export function generateWhatsAppMessage(data: WhatsAppOrderData): string {
  const { orderNumber, customerName, totalAmount, items, notes } = data;
  
  let message = `¡Hola ${customerName}! 🎉\n\n`;
  message += `*Pedido #${orderNumber}*\n`;
  message += `📦 *Productos:*\n`;
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} x${item.quantity} - $${item.price.toFixed(2)}\n`;
  });
  
  message += `\n💰 *Total: $${totalAmount.toFixed(2)}*\n`;
  
  if (notes) {
    message += `\n📝 *Notas:* ${notes}\n`;
  }
  
  message += `\nGracias por tu compra. Te contactaremos pronto para coordinar la entrega. 🚀`;
  
  return message;
}

/**
 * Genera el link de WhatsApp para el cliente
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/52${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Genera el mensaje de notificación para el admin
 */
export function generateAdminWhatsAppMessage(data: WhatsAppOrderData): string {
  const { orderNumber, customerName, customerPhone, totalAmount, items } = data;
  
  let message = `🔔 *NUEVO PEDIDO RECIBIDO*\n\n`;
  message += `📋 *Pedido:* #${orderNumber}\n`;
  message += `👤 *Cliente:* ${customerName}\n`;
  message += `📱 *Teléfono:* ${customerPhone}\n`;
  message += `💰 *Total: $${totalAmount.toFixed(2)}*\n\n`;
  message += `📦 *Productos:*\n`;
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} x${item.quantity}\n`;
  });
  
  return message;
}

/**
 * Marca el pedido como enviado por WhatsApp en la base de datos
 */
export async function markWhatsAppSent(orderId: number) {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.order.update({
      where: { id: orderId },
      data: {
        whatsappSent: true,
        whatsappSentAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking WhatsApp as sent:", error);
    return { success: false, error: "Error al marcar WhatsApp como enviado" };
  }
}
