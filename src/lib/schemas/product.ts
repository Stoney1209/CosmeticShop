"use client";

import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(3, "El SKU debe tener al menos 3 caracteres").max(50),
  name: z.string().min(2, "El nombre es obligatorio"),
  slug: z.string().min(2, "El slug es obligatorio").regex(/^[a-z0-9-]+$/, "Slug inválido"),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  costPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
  minStock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo"),
  weight: z.coerce.number().optional(),
  brand: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  mainImage: z.string().optional(),
});

export type ProductFormValues = {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  categoryId: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  weight?: number;
  brand?: string;
  isActive: boolean;
  isFeatured: boolean;
  mainImage?: string;
};
