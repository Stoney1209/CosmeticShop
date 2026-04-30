/**
 * P5: Shared TypeScript types for the admin panel.
 * Eliminates `any` usage across admin pages and components.
 */

export interface AdminProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  categoryId: number;
  price: number;
  costPrice: number | null;
  stock: number;
  minStock: number;
  mainImage: string | null;
  brand: string | null;
  weight: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: number;
    name: string;
  } | null;
  variants?: any[];
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  parentId: number | null;
}

export interface AdminVariantType {
  id: number;
  name: string;
  slug: string;
  values: {
    id: number;
    value: string;
    hexColor: string | null;
  }[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  error?: string;
  errors?: string[];
}
