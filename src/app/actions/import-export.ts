"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function exportProductsToCSV() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { sku: "asc" },
    });

    const headers = [
      "sku",
      "name",
      "slug",
      "description",
      "categoryId",
      "categoryName",
      "price",
      "costPrice",
      "stock",
      "minStock",
      "brand",
      "weight",
      "isFeatured",
      "isActive",
    ];

    const rows = products.map((p: any) => [
      p.sku,
      p.name,
      p.slug,
      p.description || "",
      p.categoryId,
      p.category?.name || "",
      p.price.toString(),
      p.costPrice?.toString() || "",
      p.stock.toString(),
      p.minStock?.toString() || "",
      p.brand || "",
      p.weight?.toString() || "",
      p.isFeatured ? "true" : "false",
      p.isActive ? "true" : "false",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n");

    return { success: true, csvContent };
  } catch (error) {
    console.error("Error exporting products:", error);
    return { success: false, error: "Error al exportar productos" };
  }
}

export async function importProductsFromCSV(csvContent: string) {
  try {
    const lines = csvContent.split("\n");
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

    const results = {
      success: 0,
      errors: 0,
      errorDetails: [] as string[],
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.replace(/"/g, "").trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      try {
        const categoryId = parseInt(row.categoryId);
        if (isNaN(categoryId)) {
          throw new Error("Invalid categoryId");
        }

        await prisma.product.upsert({
          where: { sku: row.sku },
          update: {
            name: row.name,
            slug: row.slug,
            description: row.description,
            categoryId,
            price: parseFloat(row.price),
            costPrice: row.costPrice ? parseFloat(row.costPrice) : undefined,
            stock: parseInt(row.stock),
            minStock: row.minStock ? parseInt(row.minStock) : undefined,
            brand: row.brand || null,
            weight: row.weight ? row.weight : null,
            isFeatured: row.isFeatured === "true",
            isActive: row.isActive === "true",
          },
          create: {
            sku: row.sku,
            name: row.name,
            slug: row.slug,
            description: row.description,
            categoryId,
            price: parseFloat(row.price),
            costPrice: row.costPrice ? parseFloat(row.costPrice) : undefined,
            stock: parseInt(row.stock),
            minStock: row.minStock ? parseInt(row.minStock) : undefined,
            brand: row.brand || null,
            weight: row.weight || null,
            isFeatured: row.isFeatured === "true",
            isActive: row.isActive === "true",
          },
        });

        results.success++;
      } catch (error) {
        results.errors++;
        results.errorDetails.push(`Row ${i + 1}: ${error}`);
      }
    }

    revalidatePath("/admin/productos");
    revalidatePath("/tienda");

    return { success: true, results };
  } catch (error) {
    console.error("Error importing products:", error);
    return { success: false, error: "Error al importar productos" };
  }
}
