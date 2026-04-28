import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/app/actions/invoicing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "OrderId es requerido" },
        { status: 400 }
      );
    }

    const result = await createInvoice(orderId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear factura" },
      { status: 500 }
    );
  }
}
