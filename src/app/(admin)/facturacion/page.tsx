import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Settings, Download } from "lucide-react";
import { InvoicingClient } from "./InvoicingClient";

export const metadata = { title: "Facturación | Admin" };

export default function InvoicingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Facturación</h2>
        <p className="text-slate-500">Gestiona la facturación electrónica CFDI.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos Fiscales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Configura los datos fiscales de tu empresa para emitir facturas.
          </p>
          <InvoicingClient />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración PAC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Configura los datos del PAC (Proveedor de Autorización de Certificación) para emitir facturas.
          </p>
          <Button variant="outline" disabled>
            <Settings className="mr-2 h-4 w-4" />
            Configurar PAC (Próximamente)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facturas Emitidas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            No hay facturas emitidas actualmente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
