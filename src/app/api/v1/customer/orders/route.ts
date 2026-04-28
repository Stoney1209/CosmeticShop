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

    const orders = await prisma.order.findMany({
      where: { customerId: session.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
              },
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
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
