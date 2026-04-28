import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener información del cliente" },
      { status: 500 }
    );
  }
}
