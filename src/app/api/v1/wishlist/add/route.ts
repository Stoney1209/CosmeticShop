import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "ProductId es requerido" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya está en wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        customerId_productId: {
          customerId: session.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "El producto ya está en favoritos" },
        { status: 409 }
      );
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        customerId: session.id,
        productId,
      },
      include: {
        product: {
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
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItem,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Error al agregar a favoritos" },
      { status: 500 }
    );
  }
}
