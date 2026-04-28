import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeProducts = searchParams.get("includeProducts") === "true";

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Solo categorías principales
      },
      include: {
        children: {
          where: {
            isActive: true,
          },
          include: includeProducts
            ? {
                products: {
                  where: {
                    isActive: true,
                  },
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    stock: true,
                    mainImage: true,
                  },
                },
              }
            : undefined,
          orderBy: {
            displayOrder: "asc",
          },
        },
        ...(includeProducts && {
          products: {
            where: {
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              stock: true,
              mainImage: true,
            },
          },
        }),
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
