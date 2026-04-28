import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
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
    });

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener reseñas" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { rating, title, comment, orderId } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating debe ser entre 1 y 5" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el cliente ya reseñó este producto
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        customerId: session.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "Ya has reseñado este producto" },
        { status: 409 }
      );
    }

    // Verificar si el cliente compró el producto (si se proporciona orderId)
    let isVerified = false;
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          customerId: session.id,
          items: {
            some: {
              productId: product.id,
            },
          },
        },
      });
      isVerified = !!order;
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        customerId: session.id,
        orderId: orderId || null,
        rating,
        title: title || null,
        comment: comment || null,
        isVerified,
        isApproved: false, // Requiere aprobación del admin
        isActive: true,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear reseña" },
      { status: 500 }
    );
  }
}
