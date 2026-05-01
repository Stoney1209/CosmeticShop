import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// P14: Utility functions for consistent formatting across the app

/**
 * Format price as Mexican Peso currency
 * Example: formatPrice(1234.5) -> "$1,234.50"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Format price without currency symbol
 * Example: formatPriceNumber(1234.5) -> "1,234.50"
 */
export function formatPriceNumber(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

// P14: Centralized route definitions for type-safe navigation
export const ROUTES = {
  // Shop routes
  home: "/",
  tienda: "/tienda",
  producto: (slug: string) => `/producto/${slug}`,
  cuenta: {
    login: "/cuenta/ingresar",
    register: "/cuenta/registro",
    profile: "/mi-cuenta",
    orders: "/mis-pedidos",
    wishlist: "/favoritos",
  },
  
  // Admin routes
  admin: {
    dashboard: "/dashboard",
    products: "/productos",
    categories: "/categorias",
    inventory: "/inventario",
    orders: "/pedidos",
    customers: "/clientes",
    users: "/usuarios",
    coupons: "/cupones",
    reports: "/reportes",
  },
} as const
