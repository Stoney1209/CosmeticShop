"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        parent: true,
        _count: { select: { products: true, children: true } }
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  displayOrder?: number;
  isActive?: boolean;
}) {
  try {
    const category = await prisma.category.create({
      data: {
        ...data,
      },
    });
    revalidatePath("/categorias");
    return { success: true, category };
  } catch (error: any) {
    console.error("Error creating category:", error);
    if (error?.code === "P2002") {
      return { success: false, error: "El slug ya existe" };
    }
    return { success: false, error: "Error al crear la categoría" };
  }
}

export async function updateCategory(id: number, data: Partial<{
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
}>) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data,
    });
    revalidatePath("/categorias");
    return { success: true, category };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Error al actualizar la categoría" };
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "No se puede eliminar la categoría (podría tener subcategorías o productos asociados)" };
  }
}
