import { NextRequest, NextResponse } from "next/server";
import { sendRecoveryEmail } from "@/app/actions/abandoned-carts";

export async function POST(request: NextRequest) {
  try {
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
    console.error("Error sending recovery email:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar correo de recuperación" },
      { status: 500 }
    );
  }
}
