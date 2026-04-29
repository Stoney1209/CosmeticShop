import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmail } from "@/app/actions/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token de verificación requerido" },
        { status: 400 }
      );
    }

    const result = await verifyEmail(token);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar el correo" },
      { status: 500 }
    );
  }
}
