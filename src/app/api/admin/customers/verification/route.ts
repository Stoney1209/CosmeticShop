import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api-auth";
import { validateCSRFToken } from "@/lib/csrf";

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
    
    const { id, isVerified } = await request.json();

    if (!id || typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: { isVerified },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        isVerified: customer.isVerified,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error updating customer verification:", error);
    return NextResponse.json(
      { success: false, error: "Error updating customer verification" },
      { status: 500 }
    );
  }
}
