import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, cartTotal } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Código de cupón requerido" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Cupón no válido o expirado" },
        { status: 404 }
      );
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Este cupón ha expirado" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "Este cupón ya alcanzó su límite de uso" },
        { status: 400 }
      );
    }

    // Check min amount
    const total = cartTotal || 0;
    if (coupon.minAmount && total < Number(coupon.minAmount)) {
      return NextResponse.json(
        { success: false, error: `Compra mínima de $${Number(coupon.minAmount).toFixed(2)} requerida` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = total * (Number(coupon.value) / 100);
    } else {
      discountAmount = Number(coupon.value);
    }

    // Apply max discount if applicable
    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
      discountAmount = Number(coupon.maxDiscount);
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: Number(coupon.value),
        discountAmount,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Error al validar el cupón" },
      { status: 500 }
    );
  }
}
