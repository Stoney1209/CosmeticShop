import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { ImportExportClient } from "./ImportExportClient";

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
            <ImportExportClient />
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
            <form action="/api/admin/import/products" method="POST" encType="multipart/form-data">
              <input 
                type="file" 
                name="file" 
                accept=".csv" 
                className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
              <Button type="submit" className="w-full" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
            </form>
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
            sku, name, slug, description, categoryId, categoryName, price, costPrice, stock, minStock, brand, weight, isFeatured, isActive
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
