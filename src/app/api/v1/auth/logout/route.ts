import { NextRequest, NextResponse } from "next/server";
import { clearCustomerSession } from "@/lib/customer-session";

export async function POST(request: NextRequest) {
  try {
    await clearCustomerSession();

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.error("Error logging out customer:", error);
    return NextResponse.json(
      { success: false, error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
