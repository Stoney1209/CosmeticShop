import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@cosmeticsshop.com";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmailWithRetry({ to, subject, html, text, maxRetries = 3 }: { to: string; subject: string; html: string; text?: string; maxRetries?: number }) {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(),
      });

      if (error) {
        console.error(`Error sending email (attempt ${attempt}/${maxRetries}):`, error);
        lastError = error;
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      } else {
        return data;
      }
    } catch (error) {
      console.error(`Error sending email (attempt ${attempt}/${maxRetries}):`, error);
      lastError = error;
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error("Failed to send email after retries");
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Validate email
    if (!to || !to.includes("@")) {
      console.error("Invalid email address:", to);
      return { success: false, error: "Invalid email address" };
    }

    const data = await sendEmailWithRetry({ to, subject, html, text });
    console.log("Email sent successfully:", { to, subject, id: data?.id });
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Error sending email after retries:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
  }
}

export function generateWelcomeEmail(name: string) {
  return {
    subject: "¡Bienvenido a Cosmetics Shop!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">¡Bienvenido a Cosmetics Shop!</h1>
        <p>Hola ${name},</p>
        <p>Gracias por registrarte en Cosmetics Shop. Estamos emocionados de tenerte con nosotros.</p>
        <p>Explora nuestro catálogo de productos de alta calidad y encuentra todo lo que necesitas para tu rutina de belleza.</p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>¡Disfruta de tu experiencia de compra!</p>
        <p>El equipo de Cosmetics Shop</p>
      </div>
    `,
    text: `¡Bienvenido a Cosmetics Shop! Hola ${name}, gracias por registrarte. Explora nuestro catálogo de productos de alta calidad.`,
  };
}

export function generateOrderConfirmationEmail(orderNumber: string, totalAmount: number) {
  return {
    subject: `Confirmación de pedido #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">¡Pedido Confirmado!</h1>
        <p>Tu pedido #${orderNumber} ha sido confirmado.</p>
        <p>Total: $${totalAmount.toFixed(2)}</p>
        <p>Te notificaremos cuando tu pedido sea enviado.</p>
        <p>Gracias por tu compra.</p>
        <p>El equipo de Cosmetics Shop</p>
      </div>
    `,
    text: `¡Pedido Confirmado! Tu pedido #${orderNumber} ha sido confirmado. Total: $${totalAmount.toFixed(2)}. Te notificaremos cuando sea enviado.`,
  };
}

export function generatePasswordResetEmail(resetUrl: string) {
  return {
    subject: "Restablecer tu contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">Restablecer tu contraseña</h1>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetUrl}" style="color: #ec4899;">Restablecer contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <p>El equipo de Cosmetics Shop</p>
      </div>
    `,
    text: `Restablecer tu contraseña. Haz clic en el siguiente enlace: ${resetUrl}. Este enlace expirará en 1 hora.`,
  };
}

export function generateEmailVerificationEmail(verificationUrl: string, name: string) {
  return {
    subject: "Verifica tu correo electrónico - Cosmetics Shop",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">Verifica tu correo electrónico</h1>
        <p>Hola ${name},</p>
        <p>Gracias por registrarte en Cosmetics Shop. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
        <p><a href="${verificationUrl}" style="color: #ec4899; display: inline-block; padding: 12px 24px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 6px;">Verificar mi correo</a></p>
        <p>O copia y pega este enlace en tu navegador: ${verificationUrl}</p>
        <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        <p>El equipo de Cosmetics Shop</p>
      </div>
    `,
    text: `Verifica tu correo electrónico. Hola ${name}, visita este enlace para verificar tu cuenta: ${verificationUrl}`,
  };
}

export function generateAdminOrderNotificationEmail(orderNumber: string, totalAmount: number, customerName: string, items: Array<{name: string, quantity: number, price: number}>) {
  const itemsList = items.map(item => `<li>${item.name} x${item.quantity} - $${item.price.toFixed(2)}</li>`).join('');
  
  return {
    subject: `Nuevo pedido #${orderNumber} - Cosmetics Shop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">¡Nuevo Pedido Recibido!</h1>
        <p>Se ha recibido un nuevo pedido en la tienda.</p>
        <h3>Detalles del pedido:</h3>
        <ul>
          <li><strong>Número:</strong> ${orderNumber}</li>
          <li><strong>Cliente:</strong> ${customerName}</li>
          <li><strong>Total:</strong> $${totalAmount.toFixed(2)}</li>
        </ul>
        <h3>Productos:</h3>
        <ul>${itemsList}</ul>
        <p>Accede al panel de administración para procesar el pedido.</p>
      </div>
    `,
    text: `Nuevo pedido #${orderNumber} de ${customerName} por $${totalAmount.toFixed(2)}`,
  };
}

export function generateAbandonedCartEmail(customerName: string, cartUrl: string, items: Array<{name: string, price: number}>) {
  const itemsList = items.map(item => `<li>${item.name} - $${item.price.toFixed(2)}</li>`).join('');
  
  return {
    subject: "¿Olvidaste algo en tu carrito? - Cosmetics Shop",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">¿Olvidaste algo?</h1>
        <p>Hola ${customerName},</p>
        <p>Vimos que dejaste algunos productos en tu carrito. ¡No te preocupes, los guardamos para ti!</p>
        <h3>Tu carrito contiene:</h3>
        <ul>${itemsList}</ul>
        <p><a href="${cartUrl}" style="color: #ec4899; display: inline-block; padding: 12px 24px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 6px;">Completar mi compra</a></p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>El equipo de Cosmetics Shop</p>
      </div>
    `,
    text: `¿Olvidaste algo en tu carrito? Hola ${customerName}, completa tu compra aquí: ${cartUrl}`,
  };
}

export function generateOrderStatusUpdateEmail(orderNumber: string, status: string, customerName: string) {
  const statusMessages: Record<string, string> = {
    PENDING: "Tu pedido está pendiente de confirmación.",
    CONFIRMED: "¡Tu pedido ha sido confirmado!",
    PROCESSING: "Tu pedido está siendo procesado.",
    COMPLETED: "¡Tu pedido ha sido completado!",
    CANCELLED: "Tu pedido ha sido cancelado.",
  };

  return {
    subject: `Actualización de tu pedido #${orderNumber} - Cosmetics Shop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899;">Actualización de Pedido</h1>
        <p>Hola ${customerName},</p>
        <p>${statusMessages[status] || "Hay una actualización en tu pedido."}</p>
        <p><strong>Número de pedido:</strong> ${orderNumber}</p>
        <p><strong>Estado:</strong> ${status}</p>
        <p>Puedes ver más detalles en tu cuenta.</p>
        <p>El equipo de Cosmetics Shop</p>
      </div>
    `,
    text: `Actualización de tu pedido #${orderNumber}: ${statusMessages[status]}`,
  };
}
