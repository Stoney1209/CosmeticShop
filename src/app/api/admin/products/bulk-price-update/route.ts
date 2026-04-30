import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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
    console.error("Error updating product prices:", error);
    return NextResponse.json(
      { success: false, error: "Error updating prices" },
      { status: 500 }
    );
  }
}
