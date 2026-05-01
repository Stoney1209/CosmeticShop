"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clearCustomerSession, getCustomerSession, setCustomerSession } from "@/lib/customer-session";
import { sendEmail, generateWelcomeEmail, generatePasswordResetEmail } from "@/lib/email";
import { recordLoginAttempt, isIpBlocked, getRecentFailedAttempts } from "@/lib/security";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerCustomer(data: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const email = normalizeEmail(data.email);

  if (!data.fullName.trim() || !email || !data.password.trim()) {
    return { success: false, error: "Completa los campos obligatorios." };
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Ese correo ya está registrado." };
  }

  const password = await bcrypt.hash(data.password, 10);
  const customer = await prisma.customer.create({
    data: {
      fullName: data.fullName.trim(),
      email,
      password,
      phone: data.phone?.trim() || null,
      isVerified: true,
    },
  });

  await setCustomerSession({
    id: customer.id,
    email: customer.email,
    fullName: customer.fullName,
  });

  // Send welcome email
  const { subject, html, text } = generateWelcomeEmail(customer.fullName);
  await sendEmail({ to: customer.email, subject, html, text });

  revalidatePath("/");
  return { success: true };
}

export async function loginCustomer(data: { email: string; password: string; ipAddress?: string }) {
  const email = normalizeEmail(data.email);
  const ipAddress = data.ipAddress || "unknown";

  // Check if IP is blocked
  if (await isIpBlocked(ipAddress)) {
    return { success: false, error: "Demasiados intentos fallidos. Intenta más tarde." };
  }

  const customer = await prisma.customer.findUnique({ where: { email } });

  if (!customer || !customer.isActive) {
    await recordLoginAttempt(ipAddress, false);
    return { success: false, error: "Credenciales incorrectas." };
  }

  const valid = await bcrypt.compare(data.password, customer.password);
  if (!valid) {
    await recordLoginAttempt(ipAddress, false);
    const recentAttempts = await getRecentFailedAttempts(ipAddress);
    if (recentAttempts > 0) {
      return { success: false, error: `Credenciales incorrectas. Intentos restantes: ${5 - recentAttempts}` };
    }
    return { success: false, error: "Credenciales incorrectas." };
  }

  await recordLoginAttempt(ipAddress, true);
  await setCustomerSession({
    id: customer.id,
    email: customer.email,
    fullName: customer.fullName,
  });

  revalidatePath("/");
  return { success: true };
}

export async function logoutCustomer() {
  await clearCustomerSession();
  revalidatePath("/");
  return { success: true };
}

export async function updateCustomerProfile(data: {
  fullName: string;
  phone?: string;
}) {
  const session = await getCustomerSession();
  if (!session) {
    return { success: false, error: "Tu sesión ya no está activa." };
  }

  const fullName = data.fullName.trim();
  if (!fullName) {
    return { success: false, error: "El nombre es obligatorio." };
  }

  const customer = await prisma.customer.update({
    where: { id: session.id },
    data: {
      fullName,
      phone: data.phone?.trim() || null,
    },
  });

  await setCustomerSession({
    id: customer.id,
    email: customer.email,
    fullName: customer.fullName,
  });

  revalidatePath("/mi-cuenta");
  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const customer = await prisma.customer.findUnique({
    where: { email: normalizedEmail },
  });

  if (!customer) {
    return { success: false, error: "No existe una cuenta con ese correo." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      resetToken,
      resetExpires,
    },
  });

  // Send password reset email
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/recuperar-password?token=${resetToken}`;
  const { subject, html, text } = generatePasswordResetEmail(resetUrl);
  await sendEmail({ to: customer.email, subject, html, text });

  return { 
    success: true, 
    message: "Se ha enviado un correo con las instrucciones.",
  };
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}) {
  const customer = await prisma.customer.findFirst({
    where: {
      resetToken: data.token,
      resetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!customer) {
    return { success: false, error: "El enlace es inválido o ha expirado." };
  }

  if (data.newPassword.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const password = await bcrypt.hash(data.newPassword, 10);

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      password,
      resetToken: null,
      resetExpires: null,
    },
  });

  return { success: true, message: "Contraseña actualizada correctamente." };
}

export async function verifyEmail(token: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      verificationToken: token,
    },
  });

  if (!customer) {
    return { success: false, error: "El enlace de verificación es inválido." };
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  return { success: true, message: "Correo verificado correctamente." };
}

