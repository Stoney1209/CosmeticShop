import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const results = {
      imported: 0,
      errors: [] as string[],
      skipped: 0
    };

    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const data: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          if (value !== undefined && value !== '') {
            switch (header) {
              case 'categoryId':
              case 'stock':
              case 'minStock':
                data[header] = parseInt(value);
                break;
              case 'price':
              case 'costPrice':
              case 'weight':
                data[header] = parseFloat(value);
                break;
              case 'isFeatured':
              case 'isActive':
                data[header] = value.toLowerCase() === 'true' || value === '1';
                break;
              default:
                data[header] = value;
            }
          }
        });

        // Check if product with same SKU exists
        const existing = await prisma.product.findUnique({
          where: { sku: data.sku }
        });

        if (existing) {
          // Update existing
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: data.name || existing.name,
              price: data.price !== undefined ? data.price : existing.price,
              costPrice: data.costPrice !== undefined ? data.costPrice : existing.costPrice,
              stock: data.stock !== undefined ? data.stock : existing.stock,
              minStock: data.minStock !== undefined ? data.minStock : existing.minStock,
              isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
              isFeatured: data.isFeatured !== undefined ? data.isFeatured : existing.isFeatured,
            }
          });
        } else {
          // Create new
          await prisma.product.create({
            data: {
              sku: data.sku,
              name: data.name,
              slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: data.description || '',
              categoryId: data.categoryId || 1,
              price: data.price || 0,
              costPrice: data.costPrice,
              stock: data.stock || 0,
              minStock: data.minStock || 10,
              brand: data.brand || '',
              weight: data.weight,
              isActive: data.isActive !== undefined ? data.isActive : true,
              isFeatured: data.isFeatured || false,
            }
          });
        }
        
        results.imported++;
      } catch (error: any) {
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.imported,
      errors: results.errors,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error importing products:", error);
    return NextResponse.json(
      { success: false, error: "Error importing products" },
      { status: 500 }
    );
  }
}
