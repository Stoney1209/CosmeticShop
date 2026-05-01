"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminServerAuth } from "@/lib/server-auth";
import { createCouponSchema } from "@/lib/validations";

export async function getCoupons() {
  await requireAdminServerAuth();
  try {
    return await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
}

export async function createCoupon(data: {
  code: string;
  discountType: string;
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
}) {
  await requireAdminServerAuth();
  try {
    // Validate input with Zod
    const validatedData = createCouponSchema.parse(data);
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      }
    });
    revalidatePath("/cupones");
    return coupon;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw new Error("Error al crear cupón");
  }
}

export async function toggleCouponStatus(id: number, isActive: boolean) {
  await requireAdminServerAuth();
  try {
    await prisma.coupon.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/cupones");
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    throw new Error("Error al actualizar estado del cupón");
  }
}

export async function deleteCoupon(id: number) {
  await requireAdminServerAuth();
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/cupones");
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw new Error("Error al eliminar cupón");
  }
}
