import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
