"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: {
          include: {
            values: {
              include: { type: true }
            }
          }
        }
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
  variants?: {
    sku: string;
    price?: number;
    stock: number;
    valueIds: number[];
  }[];
}) {
  try {
    const { variants, ...productData } = data;

    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: variants ? {
          create: variants.map(v => ({
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            values: {
              connect: v.valueIds.map(id => ({ id }))
            }
          }))
        } : undefined
      },
      include: { category: true, variants: true }
    });

    revalidatePath("/productos");
    revalidatePath("/inventario");
    return { success: true, product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error?.code === "P2002") {
      return { success: false, error: "El SKU o el slug ya existen" };
    }
    return { success: false, error: "Error al crear el producto" };
  }
}

export async function updateProduct(id: number, data: any) {
  try {
    const { variants, ...productData } = data;

    // Para simplificar el update de variantes, eliminamos las anteriores y creamos las nuevas
    // (En un sistema real más complejo haríamos una sincronización fina)
    if (variants) {
      await prisma.productVariant.deleteMany({
        where: { productId: id }
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        variants: variants ? {
          create: variants.map((v: any) => ({
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            values: {
              connect: v.valueIds.map((vid: number) => ({ id: vid }))
            }
          }))
        } : undefined
      },
      include: { category: true }
    });

    revalidatePath("/productos");
    revalidatePath("/inventario");
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
