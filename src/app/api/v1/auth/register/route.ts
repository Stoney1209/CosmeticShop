import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { setCustomerSession } from "@/lib/customer-session";
import { sendEmail, generateEmailVerificationEmail, generateWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, phone } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
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
