import { NextRequest, NextResponse } from "next/server";
import { importProductsFromCSV } from "@/app/actions/import-export";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

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
