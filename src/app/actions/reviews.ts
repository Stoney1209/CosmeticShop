"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";

export async function createReview(data: {
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
}) {
  const session = await getCustomerSession();
  if (!session) {
    return { success: false, error: "Necesitas iniciar sesión para dejar una reseña." };
  }

  if (data.rating < 1 || data.rating > 5) {
    return { success: false, error: "La calificación debe ser entre 1 y 5." };
  }

  const alreadyReviewed = await prisma.review.findFirst({
    where: {
      productId: data.productId,
      customerId: session.id,
    },
  });

  if (alreadyReviewed) {
    return { success: false, error: "Ya reseñaste este producto." };
  }

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { slug: true },
  });

  await prisma.review.create({
    data: {
      productId: data.productId,
      customerId: session.id,
      rating: data.rating,
      title: data.title?.trim() || null,
      comment: data.comment?.trim() || null,
      isActive: true,
      isApproved: true,
      isVerified: false,
    },
  });

  if (product) {
    revalidatePath(`/producto/${product.slug}`);
  }

  return { success: true };
}
