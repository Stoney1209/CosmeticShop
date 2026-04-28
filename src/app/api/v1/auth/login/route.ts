import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setCustomerSession } from "@/lib/customer-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!customer || !customer.isActive) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      );
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
      },
    });
  } catch (error) {
    console.error("Error logging in customer:", error);
    return NextResponse.json(
      { success: false, error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
