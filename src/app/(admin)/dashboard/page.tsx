"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Users, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight, Calendar, ShoppingBag, Edit3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface DashboardData {
  salesToday: { amount: number; orders: number };
  salesMonth: { amount: number; orders: number };
  avgTicket: number;
  lowStockCount: number;
  lowStockProducts: any[];
  chartData: any[];
  recentOrders: any[];
  topProducts: any[];
  comparison: {
    revenueChange: number;
    ordersChange: number;
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    currentMonthOrders: number;
    previousMonthOrders: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-8 p-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-lg" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Ventas Hoy",
      value: `$${data.salesToday.amount.toFixed(2)}`,
      subtitle: `${data.salesToday.orders} pedidos`,
      date: today,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
      trend: null as any,
    },
    {
      title: "Ventas del Mes",
      value: `$${data.salesMonth.amount.toFixed(2)}`,
      subtitle: `${data.salesMonth.orders} pedidos`,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
      trend: {
        value: data.comparison.revenueChange,
        label: "vs mes anterior",
        positive: data.comparison.revenueChange >= 0,
      },
    },
    {
      title: "Ticket Promedio",
      value: `$${data.avgTicket.toFixed(2)}`,
      subtitle: "por pedido",
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      trend: null,
    },
    {
      title: "Stock Bajo",
      value: data.lowStockCount.toString(),
      subtitle: "productos críticos",
      icon: AlertTriangle,
      color: data.lowStockCount > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600",
      trend: null,
      alert: data.lowStockCount > 0,
    },
  ];

  return (
    <div className="space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">Panel Principal - {today}</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`border-l-4 ${stat.alert ? 'border-l-red-500' : 'border-l-slate-200'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                  {stat.trend && (
                    <span className={`text-xs flex items-center gap-0.5 ${stat.trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.trend.value).toFixed(1)}% {stat.trend.label}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts & Comparison */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Tendencia de Ventas - Últimos 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, "Ventas"]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#7a5646" 
                      strokeWidth={2}
                      dot={{ fill: '#7a5646', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#7a5646', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg">
                  <p className="text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> No hay datos de ventas recientes
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Comparativo Mensual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Ingresos</span>
                <span className={`font-medium ${data.comparison.revenueChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.comparison.revenueChange >= 0 ? '+' : ''}{data.comparison.revenueChange.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Mes actual</span>
                  <span className="font-medium">${data.comparison.currentMonthRevenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Mes anterior</span>
                  <span className="font-medium">${data.comparison.previousMonthRevenue.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-slate-400 h-2 rounded-full" 
                    style={{ 
                      width: `${data.comparison.previousMonthRevenue > 0 
                        ? (data.comparison.previousMonthRevenue / data.comparison.currentMonthRevenue * 100) 
                        : 0}%` 
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Orders Comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Pedidos</span>
                <span className={`font-medium ${data.comparison.ordersChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.comparison.ordersChange >= 0 ? '+' : ''}{data.comparison.ordersChange.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Mes actual</span>
                  <span className="font-medium">{data.comparison.currentMonthOrders}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Mes anterior</span>
                  <span className="font-medium">{data.comparison.previousMonthOrders}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-slate-400 h-2 rounded-full" 
                    style={{ 
                      width: `${data.comparison.currentMonthOrders > 0 
                        ? (data.comparison.previousMonthOrders / data.comparison.currentMonthOrders * 100) 
                        : 0}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Pedidos Recientes</CardTitle>
            <Link href="/pedidos">
              <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.length > 0 ? data.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-medium">
                      {order.customerName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">${Number(order.totalAmount).toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'COMPLETED' || order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400">No hay pedidos recientes</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top 5 Productos</CardTitle>
            <Link href="/reportes">
              <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700">Ver Reportes</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProducts.length > 0 ? data.topProducts.map((item: any, index: number) => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">
                      #{index + 1}
                    </div>
                    {item.product?.mainImage ? (
                      <img src={item.product.mainImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{item.product?.name || 'Producto'}</p>
                      <p className="text-xs text-slate-500">{item._sum.quantity} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${Number(item._sum.subtotal).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Ingresos</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400">No hay datos de ventas</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts Grid */}
      {data.lowStockProducts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between bg-red-50/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-lg font-semibold text-red-700">Alertas de Stock Crítico</CardTitle>
            </div>
            <Link href="/inventario">
              <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">Ver Inventario</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data.lowStockProducts.slice(0, 8).map((product: any) => (
                <div key={product.id} className="p-4 border border-red-100 rounded-lg bg-red-50/30 hover:bg-red-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {product.mainImage ? (
                      <img src={product.mainImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          Stock: {product.stock}
                        </span>
                        <span className="text-xs text-slate-500">
                          Mín: {product.minStock || 10}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/productos?edit=${product.id}`}>
                    <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
                      <Edit3 className="w-3 h-3 mr-1" /> Editar
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
