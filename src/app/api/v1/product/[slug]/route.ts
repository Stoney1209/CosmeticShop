import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
        variants: {
          where: {
            isActive: true,
          },
          include: {
            values: {
              include: {
                type: true,
              },
            },
          },
        },
        reviews: {
          where: {
            isActive: true,
            isApproved: true,
          },
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Incrementar contador de vistas
    await prisma.product.update({
      where: { id: product.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // Calcular rating promedio
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        avgRating,
        reviewCount: product.reviews.length,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}
