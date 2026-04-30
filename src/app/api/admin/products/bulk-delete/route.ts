import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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
    console.error("Error deleting products:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting products" },
      { status: 500 }
    );
  }
}
