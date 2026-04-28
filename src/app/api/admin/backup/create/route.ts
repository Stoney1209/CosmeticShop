import { NextResponse } from "next/server";
import { createDatabaseBackup } from "@/app/actions/backups";

export async function POST() {
  try {
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
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear respaldo" },
      { status: 500 }
    );
  }
}
