import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Mail, RefreshCw } from "lucide-react";
import { getAbandonedCarts } from "@/app/actions/abandoned-carts";
import { AbandonedCartsClient } from "./AbandonedCartsClient";

export const metadata = { title: "Carritos Abandonados | Admin" };

export default async function AbandonedCartsPage() {
  const carts = await getAbandonedCarts();
  // Serialize Decimal to string for client component
  const serializedCarts = carts.map(c => ({
    ...c,
    totalAmount: c.totalAmount.toString(),
  }));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Carritos Abandonados</h2>
        <p className="text-slate-500">Gestiona los carritos abandonados y envía correos de recuperación.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Recuperación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Correo de recuperación automático</p>
              <p className="text-sm text-slate-500">Envía un correo 1 hora después de abandonar el carrito</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Mail className="mr-2 h-4 w-4" />
              Configurar (Próximamente)
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Segundo recordatorio</p>
              <p className="text-sm text-slate-500">Envía un segundo correo 24 horas después</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Mail className="mr-2 h-4 w-4" />
              Configurar (Próximamente)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Carritos Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <AbandonedCartsClient initialCarts={serializedCarts} />
        </CardContent>
      </Card>
    </div>
  );
}
