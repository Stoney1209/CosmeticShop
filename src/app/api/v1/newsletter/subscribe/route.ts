import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, error: "Ya estás suscrito al newsletter" },
          { status: 400 }
        );
      } else {
        // Reactivate
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true }
        });
        return NextResponse.json({
          success: true,
          message: "Suscripción reactivada correctamente"
        });
      }
    }

    // Create new subscription
    await prisma.newsletterSubscriber.create({
      data: { email }
    });

    return NextResponse.json({
      success: true,
      message: "Suscripción exitosa"
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { success: false, error: "Error al suscribirse" },
      { status: 500 }
    );
  }
}
