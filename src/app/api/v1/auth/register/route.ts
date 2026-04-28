import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { setCustomerSession } from "@/lib/customer-session";

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

    // TODO: Enviar email de verificación
    // Por ahora, en desarrollo, retornamos el token
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
        verificationToken, // Solo para desarrollo
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
