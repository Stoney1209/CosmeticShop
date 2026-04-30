// Shared TypeScript types for the shop frontend — eliminates `any` usage (P7)

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  minStock: number;
  mainImage: string | null;
  brand?: string | null;
  category?: {
    name: string;
  } | null;
}

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: number | null;
  displayOrder: number;
  isActive: boolean;
  children?: CategoryNode[];
}

export interface ReviewSummary {
  averageRating: number;
  count: number;
}

export interface BrandGroup {
  brand: string | null;
  _count: { id: number };
}

export interface TiendaSearchParams {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  brand?: string;
  sort?: string;
  page?: string;
  inStock?: string;
}

/**
 * Build a URL for /tienda preserving the current filter state.
 * Centralizes the duplicated URLSearchParams logic (U7/P5).
 */
export function buildTiendaUrl(
  currentParams: TiendaSearchParams,
  overrides: Partial<TiendaSearchParams> = {}
): string {
  const merged = { ...currentParams, ...overrides };

  const params = new URLSearchParams();

  if (merged.category) params.set("category", merged.category);
  if (merged.brand) params.set("brand", merged.brand);
  if (merged.search) params.set("search", merged.search);
  if (merged.minPrice) params.set("minPrice", merged.minPrice);
  if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
  if (merged.sort) params.set("sort", merged.sort);
  if (merged.inStock === "true") params.set("inStock", "true");
  if (merged.page && merged.page !== "1") params.set("page", merged.page);

  const qs = params.toString();
  return `/tienda${qs ? `?${qs}` : ""}`;
}
