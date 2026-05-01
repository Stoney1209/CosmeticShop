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
    
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} products deleted (soft delete)`,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error deleting products:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting products" },
      { status: 500 }
    );
  }
}
