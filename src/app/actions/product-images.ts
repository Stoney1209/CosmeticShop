"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProductImages(productId: number) {
  try {
    return await prisma.productImage.findMany({
      where: { productId },
      orderBy: { displayOrder: "asc" }
    });
  } catch (error) {
    console.error("Error fetching product images:", error);
    throw new Error("Failed to fetch product images");
  }
}

export async function addProductImage(data: {
  productId: number;
  imagePath: string;
  displayOrder?: number;
  isMain?: boolean;
}) {
  try {
    // If this is set as main, unset other main images
    if (data.isMain) {
      await prisma.productImage.updateMany({
        where: { productId: data.productId },
        data: { isMain: false }
      });
    }

    const image = await prisma.productImage.create({
      data: {
        productId: data.productId,
        imagePath: data.imagePath,
        displayOrder: data.displayOrder ?? 0,
        isMain: data.isMain ?? false
      }
    });

    revalidatePath("/productos");
    revalidatePath("/tienda");
    return { success: true, image };
  } catch (error) {
    console.error("Error adding product image:", error);
    return { success: false, error: "Error al agregar imagen" };
  }
}

export async function updateProductImage(id: number, data: {
  displayOrder?: number;
  isMain?: boolean;
}) {
  try {
    const currentImage = await prisma.productImage.findUnique({ where: { id } });
    if (!currentImage) {
      return { success: false, error: "Imagen no encontrada" };
    }

    // If setting as main, unset other main images
    if (data.isMain) {
      await prisma.productImage.updateMany({
        where: { 
          productId: currentImage.productId,
          id: { not: id }
        },
        data: { isMain: false }
      });
    }

    await prisma.productImage.update({
      where: { id },
      data
    });

    revalidatePath("/productos");
    revalidatePath("/tienda");
    return { success: true };
  } catch (error) {
    console.error("Error updating product image:", error);
    return { success: false, error: "Error al actualizar imagen" };
  }
}

export async function deleteProductImage(id: number) {
  try {
    await prisma.productImage.delete({
      where: { id }
    });
    revalidatePath("/productos");
    revalidatePath("/tienda");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product image:", error);
    return { success: false, error: "Error al eliminar imagen" };
  }
}

export async function reorderProductImages(productId: number, imageIds: number[]) {
  try {
    await prisma.$transaction(
      imageIds.map((id, index) =>
        prisma.productImage.update({
          where: { id },
          data: { displayOrder: index }
        })
      )
    );
    revalidatePath("/productos");
    revalidatePath("/tienda");
    return { success: true };
  } catch (error) {
    console.error("Error reordering product images:", error);
    return { success: false, error: "Error al reordenar imágenes" };
  }
}
