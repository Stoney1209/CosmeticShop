import { NextRequest, NextResponse } from "next/server";
import { getInvoiceSettings, updateInvoiceSettings } from "@/app/actions/invoicing";
import { requireAdminAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    await requireAdminAuth();
    const settings = await getInvoiceSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error fetching invoice settings:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración fiscal" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
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
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error updating invoice settings:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración fiscal" },
      { status: 500 }
    );
  }
}
