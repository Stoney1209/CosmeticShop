import { z } from "zod";
import { config } from "@/lib/config";

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(config.maxNameLength, `El nombre no puede exceder ${config.maxNameLength} caracteres`),
  sku: z.string().min(1, "El SKU es requerido").max(config.maxSkuLength, `El SKU no puede exceder ${config.maxSkuLength} caracteres`),
  slug: z.string().min(1, "El slug es requerido").max(config.maxSlugLength, `El slug no puede exceder ${config.maxSlugLength} caracteres`),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  categoryId: z.number().int().positive("La categoría es requerida"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  costPrice: z.number().nonnegative("El costo no puede ser negativo").optional(),
  stock: z.number().int().nonnegative("El stock no puede ser negativo").default(0),
  minStock: z.number().int().nonnegative("El stock mínimo no puede ser negativo").default(config.minStockDefault),
  mainImage: z.string().url("La imagen debe ser una URL válida").optional(),
  brand: z.string().optional(),
  weight: z.string().optional(),
  isFeatured: z.boolean().default(true),
  isActive: z.boolean().default(true),
  variants: z.array(z.object({
    sku: z.string().min(1, "El SKU de variante es requerido"),
    price: z.number().positive("El precio de variante debe ser mayor a 0"),
    stock: z.number().int().nonnegative("El stock de variante no puede ser negativo"),
    valueIds: z.array(z.number().int().positive())
  })).optional()
});

export const updateProductSchema = createProductSchema.partial();

// Order validation schemas
export const createOrderSchema = z.object({
  customerName: z.string().min(1, "El nombre del cliente es requerido").max(config.maxNameLength),
  customerEmail: z.string().email("Email inválido").optional(),
  customerPhone: z.string().min(config.minPhoneDigits, `El teléfono debe tener al menos ${config.minPhoneDigits} dígitos`).optional(),
  customerAddress: z.string().min(1, "La dirección es requerida"),
  totalAmount: z.number().positive("El total debe ser mayor a 0"),
  discountAmount: z.number().nonnegative("El descuento no puede ser negativo").default(0),
  couponCode: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    productVariantId: z.number().int().positive().optional(),
    productName: z.string().min(1),
    productSku: z.string().min(1),
    quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
    unitPrice: z.number().positive("El precio unitario debe ser mayor a 0"),
    subtotal: z.number().positive("El subtotal debe ser mayor a 0"),
    variantLabel: z.string().optional()
  })).min(1, "Debe haber al menos un producto")
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional()
});

// Customer validation schemas
export const createCustomerSchema = z.object({
  fullName: z.string().min(1, "El nombre es requerido").max(config.maxNameLength),
  email: z.string().email("Email inválido"),
  password: z.string().min(config.minPasswordLength, `La contraseña debe tener al menos ${config.minPasswordLength} caracteres`)
    .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe tener al menos un carácter especial"),
  phone: z.string().min(config.minPhoneDigits, `El teléfono debe tener al menos ${config.minPhoneDigits} dígitos`).optional()
});

export const updateCustomerSchema = z.object({
  fullName: z.string().min(1).max(config.maxNameLength).optional(),
  phone: z.string().min(config.minPhoneDigits).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional()
});

// User validation schemas
export const createUserSchema = z.object({
  username: z.string().min(config.minUsernameLength, `El usuario debe tener al menos ${config.minUsernameLength} caracteres`).max(config.maxUsernameLength),
  password: z.string().min(config.minPasswordLength, `La contraseña debe tener al menos ${config.minPasswordLength} caracteres`)
    .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
  fullName: z.string().min(1).max(config.maxNameLength),
  email: z.string().email("Email inválido").optional(),
  role: z.enum(["ADMIN", "OPERATOR"]).default("OPERATOR"),
  isActive: z.boolean().default(true)
});

export const updateUserSchema = createUserSchema.partial();

// Coupon validation schemas
export const createCouponSchema = z.object({
  code: z.string().min(1, "El código es requerido").max(config.maxSkuLength).toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("El valor del descuento debe ser mayor a 0"),
  minAmount: z.number().nonnegative("El monto mínimo no puede ser negativo").optional(),
  maxDiscount: z.number().positive("El descuento máximo debe ser mayor a 0").optional(),
  expiryDate: z.string().datetime("Fecha de expiración inválida").optional(),
  usageLimit: z.number().int().positive("El límite de uso debe ser mayor a 0").optional(),
  isActive: z.boolean().default(true)
});

// Invoice settings validation schemas
export const updateInvoiceSettingsSchema = z.object({
  businessName: z.string().min(1, "El nombre del negocio es requerido").max(config.maxNameLength),
  rfc: z.string().min(config.minRfcLength, `El RFC debe tener al menos ${config.minRfcLength} caracteres`).max(config.maxRfcLength),
  address: z.string().min(1, "La dirección es requerido").max(config.maxAddressLength),
  email: z.string().email("Email inválido"),
  phone: z.string().min(config.minPhoneDigits, `El teléfono debe tener al menos ${config.minPhoneDigits} dígitos`),
  taxRate: z.number().min(0).max(1, "La tasa de impuesto debe estar entre 0 y 1")
});

// Stock movement validation schemas
export const adjustStockSchema = z.object({
  productId: z.number().int().positive("El producto es requerido"),
  quantity: z.number().int("La cantidad debe ser un entero"),
  reason: z.string().min(1, "La razón es requerida").max(500)
});
