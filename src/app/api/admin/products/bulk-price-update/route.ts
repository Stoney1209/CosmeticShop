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
    
    const { ids, percent } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0 || typeof percent !== 'number') {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get all products to update
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, price: true }
    });

    // Update each product with the percentage change
    const updates = products.map(async (product) => {
      const currentPrice = Number(product.price);
      const newPrice = currentPrice * (1 + percent / 100);
      return prisma.product.update({
        where: { id: product.id },
        data: { price: Math.round(newPrice * 100) / 100 }
      });
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: `${ids.length} products updated`,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error updating product prices:", error);
    return NextResponse.json(
      { success: false, error: "Error updating prices" },
      { status: 500 }
    );
  }
}
