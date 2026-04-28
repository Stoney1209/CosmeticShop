"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCoupons() {
  return await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });
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
  const coupon = await prisma.coupon.create({
    data: {
      ...data,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    }
  });
  revalidatePath("/cupones");
  return coupon;
}

export async function toggleCouponStatus(id: number, isActive: boolean) {
  await prisma.coupon.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath("/cupones");
}

export async function deleteCoupon(id: number) {
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/cupones");
}
