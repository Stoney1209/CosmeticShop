"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";

export async function toggleWishlist(productId: number) {
  const session = await getCustomerSession();
  if (!session) {
    return { success: false, error: "Necesitas iniciar sesión para guardar favoritos." };
  }

  const existing = await prisma.wishlist.findUnique({
    where: {
      customerId_productId: {
        customerId: session.id,
        productId,
      },
    },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/favoritos");
    return { success: true, inWishlist: false };
  }

  await prisma.wishlist.create({
    data: {
      customerId: session.id,
      productId,
    },
  });

  revalidatePath("/favoritos");
  return { success: true, inWishlist: true };
}

