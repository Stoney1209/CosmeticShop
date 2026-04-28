import { NextRequest, NextResponse } from "next/server";
import { getInvoiceSettings, updateInvoiceSettings } from "@/app/actions/invoicing";

export async function GET() {
  try {
    const settings = await getInvoiceSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching invoice settings:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración fiscal" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await updateInvoiceSettings(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating invoice settings:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración fiscal" },
      { status: 500 }
    );
  }
}
