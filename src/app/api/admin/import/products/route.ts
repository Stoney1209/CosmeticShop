import { NextRequest, NextResponse } from "next/server";
import { importProductsFromCSV } from "@/app/actions/import-export";
import { validateCSRFToken } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const csrfToken = formData.get("csrf_token") as string;
    const file = formData.get("file") as File;

    // Validate CSRF token
    if (!csrfToken) {
      return NextResponse.json(
        { success: false, error: "CSRF token missing" },
        { status: 403 }
      );
    }

    try {
      await validateCSRFToken(csrfToken);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const result = await importProductsFromCSV(csvContent);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { success: false, error: "Error al importar productos" },
      { status: 500 }
    );
  }
}
