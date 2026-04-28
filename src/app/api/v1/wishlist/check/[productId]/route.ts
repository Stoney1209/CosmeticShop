import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const productIdNum = parseInt(productId);

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        customerId_productId: {
          customerId: session.id,
          productId: productIdNum,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { inWishlist: !!wishlistItem },
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar favoritos" },
      { status: 500 }
    );
  }
}
