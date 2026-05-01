import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api-auth";
import { cleanupOldLoginAttempts } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    
    await cleanupOldLoginAttempts();
    
    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully"
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden: Admin access required")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Error during cleanup:", error);
    return NextResponse.json(
      { success: false, error: "Error during cleanup" },
      { status: 500 }
    );
  }
}
