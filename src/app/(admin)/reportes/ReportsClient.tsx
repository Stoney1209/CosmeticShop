"use client";

import { Download, TrendingUp, Users, Package, AlertTriangle, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon } from "lucide-react";

export function ReportsClient({ data }: { data: any }) {
  const totalRevenue = data.recentOrders.reduce((acc: number, o: any) => acc + Number(o.totalAmount), 0);
  const totalSales = data.recentOrders.length;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const exportCSV = () => {
    let csv = "Producto,Cantidad Vendida,Ingresos Generados\n";
    data.bestSellers.forEach((item: any) => {
      csv += `"${item.productName}",${item._sum.quantity},${item._sum.subtotal.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_ventas_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "CONFIRMED": return "bg-blue-100 text-blue-700";
      case "PROCESSING": return "bg-yellow-100 text-yellow-700";
      case "PENDING": return "bg-slate-100 text-slate-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Today & Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Pedidos Hoy</p>
          <p className="text-3xl font-bold text-slate-900">{data.today.orders}</p>
          <p className="text-sm text-green-600 mt-1">${Number(data.today.revenue).toFixed(2)}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Pedidos Este Mes</p>
          <p className="text-3xl font-bold text-slate-900">{data.month.orders}</p>
          <p className="text-sm text-green-600 mt-1">${Number(data.month.revenue).toFixed(2)}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Ingresos (30 días)</p>
          <p className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Ticket Promedio</p>
          <p className="text-3xl font-bold text-slate-900">${avgTicket.toFixed(2)}</p>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-slate-500">Clientes Totales</p>
              <p className="text-2xl font-bold text-slate-900">{data.totals.customers}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-slate-500">Productos Activos</p>
              <p className="text-2xl font-bold text-slate-900">{data.totals.products}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-slate-500">Stock Bajo (≤5)</p>
              <p className="text-2xl font-bold text-slate-900">{data.totals.lowStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div>
        <h3 className="text-lg font-bold mb-4">Pedidos por Estado</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {data.ordersByStatus.map((item: any) => (
            <div key={item.status} className="bg-white p-4 rounded-lg border border-slate-200">
              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
              <p className="text-2xl font-bold mt-2">{item._count.id}</p>
              <p className="text-sm text-slate-500">${Number(item._sum.totalAmount).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
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
                <TableCell className="text-center">{item._sum.quantity}</TableCell>
                <TableCell className="text-right font-bold text-emerald-600">${Number(item._sum.subtotal).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {data.bestSellers.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-500">No hay datos de ventas recientes.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {/* Recent Customers */}
      <div>
        <h3 className="text-lg font-bold mb-4">Clientes Recientes</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead className="text-center">Pedidos</TableHead><TableHead className="text-right">Fecha</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.recentCustomers.map((customer: any) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.fullName}</TableCell>
                <TableCell className="text-slate-500">{customer.email}</TableCell>
                <TableCell className="text-center">{customer._count.orders}</TableCell>
                <TableCell className="text-right text-slate-500">{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {data.recentCustomers.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No hay clientes registrados.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {/* Non-Rotating Products */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><AlertOctagon className="w-5 h-5"/> Productos Sin Rotación (30 días)</h3>
          <Badge variant="outline" className="text-slate-600">{data.nonRotatingProducts?.length || 0} productos</Badge>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>SKU</TableHead><TableHead>Categoría</TableHead><TableHead className="text-center">Stock</TableHead><TableHead className="text-right">Precio</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.nonRotatingProducts && data.nonRotatingProducts.length > 0 ? (
              data.nonRotatingProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    {product.mainImage ? (
                      <img src={product.mainImage} className="w-10 h-10 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border">
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                    {product.name}
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-xs">{product.sku}</TableCell>
                  <TableCell><Badge variant="outline">{product.category?.name || '-'}</Badge></TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>{product.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">${product.price.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Todos los productos han tenido ventas en los últimos 30 días.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
