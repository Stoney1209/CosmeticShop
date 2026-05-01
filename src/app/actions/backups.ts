"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminServerAuth } from "@/lib/server-auth";

export async function createDatabaseBackup() {
  await requireAdminServerAuth();
  try {
    // Get all data from all tables
    const [
      users,
      customers,
      addresses,
      categories,
      products,
      variants,
      variantTypes,
      variantValues,
      productImages,
      coupons,
      orders,
      orderItems,
      stockMovements,
      reviews,
      wishlist,
      settings,
      invoices,
      invoiceSettings,
      abandonedCarts,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.customer.findMany(),
      prisma.address.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.productVariant.findMany(),
      prisma.variantType.findMany(),
      prisma.variantValue.findMany(),
      prisma.productImage.findMany(),
      prisma.coupon.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.stockMovement.findMany(),
      prisma.review.findMany(),
      prisma.wishlist.findMany(),
      prisma.setting.findMany(),
      prisma.invoice.findMany(),
      prisma.invoiceSetting.findMany(),
      prisma.abandonedCart.findMany(),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        users,
        customers,
        addresses,
        categories,
        products,
        variants,
        variantTypes,
        variantValues,
        productImages,
        coupons,
        orders,
        orderItems,
        stockMovements,
        reviews,
        wishlist,
        settings,
        invoices,
        invoiceSettings,
        abandonedCarts,
      },
    };

    return { success: true, backup };
  } catch (error) {
    console.error("Error creating backup:", error);
    return { success: false, error: "Error al crear respaldo" };
  }
}

export async function restoreDatabaseBackup(backup: any) {
  await requireAdminServerAuth();
  try {
    // Validate backup structure
    if (!backup.timestamp || !backup.data) {
      return { success: false, error: "Formato de respaldo inválido" };
    }

    // Restore data in correct order (respecting foreign keys)
    const { data } = backup;

    // Clear existing data
    await prisma.abandonedCart.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.invoiceSetting.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.review.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.variantValue.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.variantType.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.address.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.user.deleteMany();

    // Restore data
    if (data.users?.length) await prisma.user.createMany({ data: data.users, skipDuplicates: true });
    if (data.customers?.length) await prisma.customer.createMany({ data: data.customers, skipDuplicates: true });
    if (data.addresses?.length) await prisma.address.createMany({ data: data.addresses, skipDuplicates: true });
    if (data.categories?.length) await prisma.category.createMany({ data: data.categories, skipDuplicates: true });
    if (data.settings?.length) await prisma.setting.createMany({ data: data.settings, skipDuplicates: true });
    if (data.variantTypes?.length) await prisma.variantType.createMany({ data: data.variantTypes, skipDuplicates: true });
    if (data.products?.length) await prisma.product.createMany({ data: data.products, skipDuplicates: true });
    if (data.variants?.length) await prisma.productVariant.createMany({ data: data.variants, skipDuplicates: true });
    if (data.variantValues?.length) await prisma.variantValue.createMany({ data: data.variantValues, skipDuplicates: true });
    if (data.productImages?.length) await prisma.productImage.createMany({ data: data.productImages, skipDuplicates: true });
    if (data.coupons?.length) await prisma.coupon.createMany({ data: data.coupons, skipDuplicates: true });
    if (data.orders?.length) await prisma.order.createMany({ data: data.orders, skipDuplicates: true });
    if (data.orderItems?.length) await prisma.orderItem.createMany({ data: data.orderItems, skipDuplicates: true });
    if (data.stockMovements?.length) await prisma.stockMovement.createMany({ data: data.stockMovements, skipDuplicates: true });
    if (data.reviews?.length) await prisma.review.createMany({ data: data.reviews, skipDuplicates: true });
    if (data.wishlist?.length) await prisma.wishlist.createMany({ data: data.wishlist, skipDuplicates: true });
    if (data.invoices?.length) await prisma.invoice.createMany({ data: data.invoices, skipDuplicates: true });
    if (data.invoiceSettings?.length) await prisma.invoiceSetting.createMany({ data: data.invoiceSettings, skipDuplicates: true });
    if (data.abandonedCarts?.length) await prisma.abandonedCart.createMany({ data: data.abandonedCarts, skipDuplicates: true });

    return { success: true };
  } catch (error) {
    console.error("Error restoring backup:", error);
    return { success: false, error: "Error al restaurar respaldo" };
  }
}
