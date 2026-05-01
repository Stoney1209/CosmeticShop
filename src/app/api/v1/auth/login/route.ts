import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setCustomerSession } from "@/lib/customer-session";
import { getClientIp, recordLoginAttempt, checkAndBlockIp, isIpBlocked, getRecentFailedAttempts } from "@/lib/security";

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
    const ip = getClientIp(request);

    // Check if IP is blocked
    if (await isIpBlocked(ip)) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos fallidos. Por favor intente más tarde." },
        { status: 429 }
      );
    }

    // Check recent failed attempts
    const recentAttempts = await getRecentFailedAttempts(ip);
    if (recentAttempts >= 5) {
      await checkAndBlockIp(ip);
      return NextResponse.json(
        { success: false, error: "Demasiados intentos fallidos. Por favor intente más tarde." },
        { status: 429 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!customer || !customer.isActive) {
      await recordLoginAttempt(ip, false);
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      await recordLoginAttempt(ip, false);
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Record successful login
    await recordLoginAttempt(ip, true);

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
