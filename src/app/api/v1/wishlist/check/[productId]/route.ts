import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({
        success: true,
        data: { inWishlist: false },
      });
    }

    const productId = parseInt(params.productId);

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        customerId_productId: {
          customerId: session.id,
          productId,
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
