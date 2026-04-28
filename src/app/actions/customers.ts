"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            orders: true,
            wishlist: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    // Return empty array if table doesn't exist
    if (error.code === "P2021") {
      return [];
    }
    throw new Error("Failed to fetch customers");
  }
}

export async function getCustomerById(id: number) {
  try {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        wishlist: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                price: true,
              },
            },
          },
        },
        reviews: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw new Error("Failed to fetch customer");
  }
}

export async function updateCustomerStatus(id: number, isActive: boolean) {
  try {
    await prisma.customer.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error) {
    console.error("Error updating customer status:", error);
    return { success: false, error: "Error al actualizar estado del cliente" };
  }
}

export async function updateCustomerVerification(id: number, isVerified: boolean) {
  try {
    await prisma.customer.update({
      where: { id },
      data: { isVerified },
    });

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error) {
    console.error("Error updating customer verification:", error);
    return { success: false, error: "Error al actualizar verificación del cliente" };
  }
}

export async function deleteCustomer(id: number) {
  try {
    await prisma.customer.delete({
      where: { id },
    });

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { success: false, error: "Error al eliminar cliente" };
  }
}
