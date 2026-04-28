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

    await prisma.wishlist.deleteMany({
      where: {
        customerId: session.id,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Producto eliminado de favoritos",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar de favoritos" },
      { status: 500 }
    );
  }
}
