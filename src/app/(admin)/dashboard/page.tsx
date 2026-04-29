import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | Cosmetics Admin",
};

export default async function DashboardPage() {
  // Fetch real data
  const [totalOrders, pendingOrders, completedOrdersRaw, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: ["COMPLETED", "CONFIRMED"] } },
      _sum: { totalAmount: true }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const totalRevenue = Number(completedOrdersRaw._sum.totalAmount || 0);

  const stats = [
    {
      title: "Ingresos Totales",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "Calculado sobre órdenes completadas",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Órdenes Totales",
      value: totalOrders.toString(),
      change: "En todo el historial",
      icon: Package,
      trend: "up",
    },
    {
      title: "Pedidos Pendientes",
      value: pendingOrders.toString(),
      change: "Requieren tu atención",
      icon: Clock,
      trend: pendingOrders > 0 ? "down" : "up",
    },
    {
      title: "Conversión",
      value: "N/A",
      change: "Métrica en desarrollo",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-2">Resumen general del rendimiento de tu tienda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200 m-6 mt-0">
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Las gráficas requieren integración con librerías de terceros (ej. Recharts)
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-medium transition-colors">
                      {order.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">${Number(order.totalAmount).toFixed(2)}</p>
                    <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
                      order.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                      order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                      order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Aún no hay pedidos recientes.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
