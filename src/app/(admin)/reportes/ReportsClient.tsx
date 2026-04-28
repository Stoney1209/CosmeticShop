"use client";

import { Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ReportsClient({ data }: { data: any }) {
  const totalRevenue = data.recentOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalSales = data.recentOrders.length;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const exportCSV = () => {
    let csv = "Producto,Cantidad Vendida,Ingresos Generados\n";
    data.bestSellers.forEach((item: any) => {
      csv += `"${item.productName}",${item.quantity},${item.subtotal.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_ventas_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Ingresos (30 días)</p>
          <p className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Ventas Completadas</p>
          <p className="text-3xl font-bold text-slate-900">{totalSales}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Ticket Promedio</p>
          <p className="text-3xl font-bold text-slate-900">${avgTicket.toFixed(2)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Top 10 Más Vendidos</h3>
          <Button onClick={exportCSV} variant="outline" size="sm"><Download className="w-4 h-4 mr-2"/> Exportar a CSV</Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-center">Unidades Vendidas</TableHead><TableHead className="text-right">Ingresos</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.bestSellers.map((item: any, i: number) => (
              <TableRow key={item.productId}>
                <TableCell className="font-medium">
                  <span className="text-slate-400 mr-2">#{i+1}</span> {item.productName}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right font-bold text-emerald-600">${item.subtotal.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {data.bestSellers.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-500">No hay datos de ventas recientes.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
