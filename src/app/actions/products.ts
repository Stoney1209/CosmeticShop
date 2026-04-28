"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function createProduct(data: {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: number;
  price: number;
  costPrice?: number;
  stock?: number;
  minStock?: number;
  mainImage?: string;
  brand?: string;
  isActive?: boolean;
}) {
  try {
    const product = await prisma.product.create({
      data: {
        ...data,
      },
      include: { category: true }
    });
    revalidatePath("/productos");
    return { success: true, product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error?.code === "P2002") {
      return { success: false, error: "El SKU o el slug ya existen" };
    }
    return { success: false, error: "Error al crear el producto" };
  }
}

export async function updateProduct(id: number, data: Partial<{
  sku: string;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  mainImage: string;
  brand: string;
  isActive: boolean;
}>) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true }
    });
    revalidatePath("/productos");
    return { success: true, product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Error al actualizar el producto" };
  }
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/productos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "No se puede eliminar el producto porque tiene historial asociado" };
  }
}
