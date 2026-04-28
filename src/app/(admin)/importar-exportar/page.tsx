import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";

export const metadata = { title: "Importar/Exportar | Admin" };

export default function ImportExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Importar/Exportar</h2>
        <p className="text-slate-500">Gestiona la importación y exportación masiva de productos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exportar Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Exporta todos los productos a formato CSV para editarlos externamente.
            </p>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importar Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Importa productos desde un archivo CSV. El archivo debe seguir el formato de exportación.
            </p>
            <Button className="w-full" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formato del CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            El archivo CSV debe tener las siguientes columnas:
          </p>
          <code className="text-xs bg-slate-100 p-2 rounded block">
            sku, name, slug, description, categoryId, price, costPrice, stock, minStock, brand, weight, isFeatured, isActive
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
