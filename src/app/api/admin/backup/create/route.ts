import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDatabaseBackup } from "@/app/actions/backups";
import { requireAdminAuth } from "@/lib/api-auth";
import { validateCSRFToken } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth();
    
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken) {
      return NextResponse.json(
        { success: false, error: "CSRF token missing" },
        { status: 403 }
      );
    }
    await validateCSRFToken(csrfToken);

    const result = await createDatabaseBackup();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return new NextResponse(JSON.stringify(result.backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear respaldo" },
      { status: 500 }
    );
  }
}
