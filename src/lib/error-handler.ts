import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, details: error.details },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    if (error.message === "Forbidden: Admin access required") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Prisma errors
    if (error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: "El registro ya existe" },
        { status: 409 }
      );
    }

    if (error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: "Registro no encontrado" },
        { status: 404 }
      );
    }

    // Generic error
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }

  // Unknown error
  return NextResponse.json(
    { success: false, error: "Error interno del servidor" },
    { status: 500 }
  );
}
