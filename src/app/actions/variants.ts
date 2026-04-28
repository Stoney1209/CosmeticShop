"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// TIPOS DE VARIANTE (Color, Talla, etc.)
export async function getVariantTypes() {
  return await prisma.variantType.findMany({
    include: { values: true },
    orderBy: { name: "asc" }
  });
}

export async function createVariantType(name: string, slug: string) {
  const type = await prisma.variantType.create({
    data: { name, slug }
  });
  revalidatePath("/configuracion/variantes");
  return type;
}

export async function deleteVariantType(id: number) {
  await prisma.variantType.delete({ where: { id } });
  revalidatePath("/configuracion/variantes");
}

// VALORES DE VARIANTE (Rojo, 50ml, etc.)
export async function createVariantValue(data: { variantTypeId: number, value: string, hexColor?: string }) {
  const newValue = await prisma.variantValue.create({
    data
  });
  revalidatePath("/configuracion/variantes");
  return newValue;
}

export async function deleteVariantValue(id: number) {
  await prisma.variantValue.delete({ where: { id } });
  revalidatePath("/configuracion/variantes");
}
