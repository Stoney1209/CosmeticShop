"use server";

import { prisma } from "@/lib/prisma";

export async function validateCoupon(code: string, cartTotal: number) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), isActive: true }
    });

    if (!coupon) {
      return { success: false, error: "Cupón no válido o expirado" };
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { success: false, error: "Este cupón ha expirado" };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { success: false, error: "Este cupón ya alcanzó su límite de uso" };
    }

    // Check min amount
    if (coupon.minAmount && cartTotal < Number(coupon.minAmount)) {
      return { success: false, error: `Compra mínima de $${Number(coupon.minAmount).toFixed(2)} requerida` };
    }

    return { 
      success: true, 
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: Number(coupon.value),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null
      } 
    };
  } catch (error) {
    return { success: false, error: "Error al validar el cupón" };
  }
}
