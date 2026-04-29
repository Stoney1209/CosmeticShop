"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventory() {
  const products = await prisma.product.findMany({
    select: { id: true, sku: true, name: true, stock: true, minStock: true, price: true, costPrice: true, category: { select: { name: true } } },
    orderBy: { stock: "asc" }
  });
  const movements = await prisma.stockMovement.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, sku: true } }, user: { select: { username: true } } }
  });
  return { products, movements };
}

export async function adjustStock(productId: number, newStock: number, notes: string) {
  try {
    await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if(!product) throw new Error("Product not found");
      const diff = newStock - product.stock;
      if(diff === 0) return;
      
      await tx.product.update({ where: { id: productId }, data: { stock: newStock } });
      await tx.stockMovement.create({
        data: {
          productId,
          movementType: "ADJUSTMENT",
          quantity: Math.abs(diff),
          previousStock: product.stock,
          newStock: newStock,
          notes,
          userId: 1 // Defaulting to admin 1 since session isn't immediately available here
        }
      });
    });
    revalidatePath("/inventario");
    revalidatePath("/productos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al ajustar inventario" };
  }
}
