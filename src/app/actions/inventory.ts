"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminServerAuth } from "@/lib/server-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { config } from "@/lib/config";

export async function getInventory() {
  await requireAdminServerAuth();
  const products = await prisma.product.findMany({
    select: { id: true, sku: true, name: true, stock: true, minStock: true, price: true, costPrice: true, category: { select: { name: true } } },
    orderBy: { stock: "asc" }
  });
  const movements = await prisma.stockMovement.findMany({
    take: config.defaultPageSize,
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, sku: true } }, user: { select: { username: true } } }
  });
  return { products, movements };
}

export async function adjustStock(productId: number, quantity: number, reason: string) {
  const session = await requireAdminServerAuth();
  try {
    // Get user ID from session
    const user = await prisma.user.findFirst({
      where: { username: (session.user as any).username },
      select: { id: true }
    });
    
    const userId = user?.id || 1;

    await prisma.$transaction(
      async (tx: any) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if(!product) throw new Error("Product not found");
      const diff = quantity;
      if(diff === 0) return;
      const newStock = product.stock + diff;
      
      await tx.product.update({ where: { id: productId }, data: { stock: newStock } });
      await tx.stockMovement.create({
        data: {
          productId,
          movementType: "ADJUSTMENT",
          quantity: Math.abs(diff),
          previousStock: product.stock,
          newStock: newStock,
          notes: reason,
          userId
        }
      });
    },
    { timeout: config.transactionTimeoutMs } // Transaction timeout from config
    );
    revalidatePath("/inventario");
    revalidatePath("/productos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al ajustar inventario" };
  }
}
