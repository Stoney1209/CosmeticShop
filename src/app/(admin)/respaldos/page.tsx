import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Clock } from "lucide-react";

export const metadata = { title: "Respaldos | Admin" };

export default function BackupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Respaldos</h2>
        <p className="text-slate-500">Gestiona los respaldos de la base de datos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear Respaldo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Crea un respaldo completo de la base de datos. El archivo se descargará en formato SQL.
          </p>
          <Button className="w-full">
            <Database className="mr-2 h-4 w-4" />
            Crear Respaldo Ahora
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Respaldos Automáticos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Respaldo diario</p>
              <p className="text-sm text-slate-500">Se crea automáticamente a las 3:00 AM</p>
            </div>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Retención</p>
              <p className="text-sm text-slate-500">Se mantienen los últimos 7 respaldos</p>
            </div>
            <Download className="h-5 w-5 text-slate-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Respaldos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            No hay respaldos disponibles actualmente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
