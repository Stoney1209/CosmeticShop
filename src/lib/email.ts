interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // TODO: Configure email provider (Resend, SendGrid, Nodemailer, etc.)
  // For now, this is a placeholder that logs the email
  console.log("Email would be sent:", { to, subject, html, text });
  
  // Example integration with Resend (uncomment and configure):
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: process.env.EMAIL_FROM || 'noreply@cosmeticsshop.com',
  //   to,
  //   subject,
  //   html,
  //   text,
  // });

  return { success: true };
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
