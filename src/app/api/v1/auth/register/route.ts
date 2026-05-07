import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { setCustomerSession } from "@/lib/customer-session";
import { sendEmail, generateEmailVerificationEmail, generateWelcomeEmail } from "@/lib/email";
import { z } from "zod";
import { getClientIp, isIpBlocked, getRecentFailedAttempts, checkAndBlockIp, recordLoginAttempt } from "@/lib/security";

const registerSchema = z.object({
  fullName: z.string().min(2, "El nombre completo debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone } = validation.data;

    const ip = getClientIp(request);
    if (await isIpBlocked(ip)) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos. Por favor intente más tarde." },
        { status: 429 }
      );
    }
    const recentAttempts = await getRecentFailedAttempts(ip);
    if (recentAttempts >= 5) {
      await checkAndBlockIp(ip);
      return NextResponse.json(
        { success: false, error: "Demasiados intentos. Por favor intente más tarde." },
        { status: 429 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      await recordLoginAttempt(ip, false);
      return NextResponse.json(
        { success: false, error: "Ese correo ya está registrado" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const customer = await prisma.customer.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        verificationToken,
        isVerified: false,
      },
    });

    // Send verification email
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationUrl = `${appUrl}/verificar-email?token=${verificationToken}`;
      
      const { subject, html, text } = generateEmailVerificationEmail(verificationUrl, customer.fullName);
      await sendEmail({ to: customer.email, subject, html, text });
      
      // Also send welcome email
      const welcomeEmail = generateWelcomeEmail(customer.fullName);
      await sendEmail({ to: customer.email, subject: welcomeEmail.subject, html: welcomeEmail.html, text: welcomeEmail.text });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Don't fail registration if email fails, but log it
    }

    await setCustomerSession({
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        fullName: customer.fullName,
        isVerified: customer.isVerified,
        message: "Revisa tu correo para verificar tu cuenta",
      },
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar cliente" },
      { status: 500 }
    );
  }
}
