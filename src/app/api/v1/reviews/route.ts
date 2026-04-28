import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    const where: any = {
      isActive: true,
      isApproved: true,
    };

    if (productId) {
      where.productId = parseInt(productId);
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
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
