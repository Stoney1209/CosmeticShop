import { prisma } from "@/lib/prisma";
import { VariantsClient } from "./VariantsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function VariantsPage() {
  const variantTypes = await prisma.variantType.findMany({
    include: { values: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="bg-white rounded-2xl border border-[var(--outline-variant)]/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-lowest)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)] flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-[var(--on-primary-container)]" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-[var(--on-surface)]">
                Tipos de Variantes
              </h1>
              <p className="text-sm text-[var(--outline)]">
                Gestiona las opciones de variación para tus productos (color, tamaño, tono, etc.)
              </p>
            </div>
          </div>
          <Link href="/productos">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Productos
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-6">
        <VariantsClient initialData={variantTypes} />
      </div>
    </div>
  );
}
