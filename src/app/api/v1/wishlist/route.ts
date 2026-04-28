import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { customerId: session.id },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener favoritos" },
      { status: 500 }
    );
  }
}
