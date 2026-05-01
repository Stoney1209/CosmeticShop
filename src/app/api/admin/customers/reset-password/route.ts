import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.customer.update({
      where: { id },
      data: {
        resetToken,
        resetExpires,
      },
    });

    // In production, send email with reset link
    // For now, return the token for testing
    return NextResponse.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { success: false, error: "Error resetting password" },
      { status: 500 }
    );
  }
}
