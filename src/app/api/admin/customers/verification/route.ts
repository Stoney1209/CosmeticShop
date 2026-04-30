import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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
    console.error("Error updating customer verification:", error);
    return NextResponse.json(
      { success: false, error: "Error updating customer verification" },
      { status: 500 }
    );
  }
}
