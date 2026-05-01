import { NextRequest, NextResponse } from "next/server";
import { sendRecoveryEmail } from "@/app/actions/abandoned-carts";
import { requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    const body = await request.json();
    const { cartId } = body;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: "CartId es requerido" },
        { status: 400 }
      );
    }

    const result = await sendRecoveryEmail(cartId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error sending recovery email:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar correo de recuperación" },
      { status: 500 }
    );
  }
}
