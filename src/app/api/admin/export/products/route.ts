import { NextResponse } from "next/server";
import { exportProductsToCSV } from "@/app/actions/import-export";

export async function GET() {
  try {
    const result = await exportProductsToCSV();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return new NextResponse(result.csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="products_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting products:", error);
    return NextResponse.json(
      { success: false, error: "Error al exportar productos" },
      { status: 500 }
    );
  }
}
