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
      data: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} products activated`,
    });
  } catch (error) {
    console.error("Error activating products:", error);
    return NextResponse.json(
      { success: false, error: "Error activating products" },
      { status: 500 }
    );
  }
}
