import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { id, isActive } = await request.json();

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        isActive: customer.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating customer status:", error);
    return NextResponse.json(
      { success: false, error: "Error updating customer status" },
      { status: 500 }
    );
  }
}
