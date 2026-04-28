import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock") === "true";
    const featured = searchParams.get("featured") === "true";

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (featured) {
      where.isFeatured = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            where: { isMain: true },
            take: 1,
          },
          variants: {
            where: { isActive: true },
            include: {
              values: {
                include: {
                  type: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}
