import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api-auth";
import { validateCSRFToken } from "@/lib/csrf";
import { createInvoice } from "@/app/actions/invoicing";

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken) {
      return NextResponse.json(
        { success: false, error: "CSRF token missing" },
        { status: 403 }
      );
    }
    await validateCSRFToken(csrfToken);
    
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "OrderId es requerido" },
        { status: 400 }
      );
    }

    const result = await createInvoice(orderId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear factura" },
      { status: 500 }
    );
  }
}
