"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingBag, 
  Edit3,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDashboardData, STATUS_LABELS, type DashboardData } from "@/app/actions/dashboard";
import { SalesChart, ComparisonBar } from "@/components/admin/DashboardCharts";
import Image from "next/image";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const today = new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="w-12 h-12 text-[var(--error)]" />
        <h2 className="text-xl font-bold">Error al cargar el dashboard</h2>
        <p className="text-[var(--on-surface-variant)] text-center max-w-md">No se pudo conectar con el servidor.</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Ventas Hoy",
      value: `$${data.salesToday.amount.toFixed(2)}`,
      subtitle: `${data.salesToday.orders} pedidos`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
      trend: null,
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
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-heading font-bold text-[var(--on-surface)]">Dashboard</h1>
        <p className="text-[var(--on-surface-variant)] mt-1">{today}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`border-l-4 ${stat.alert ? 'border-l-[var(--error)]' : 'border-l-[var(--outline-variant)]'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[var(--on-surface-variant)]">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--on-surface)]">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-[var(--on-surface-variant)]">{stat.subtitle}</p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Tendencia de Ventas - Últimos 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={data.chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Comparativo Mensual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--on-surface-variant)] font-medium">Ingresos</span>
                <span className={`font-bold ${data.comparison.revenueChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.comparison.revenueChange >= 0 ? '+' : ''}{data.comparison.revenueChange.toFixed(1)}%
                </span>
              </div>
              <ComparisonBar 
                currentValue={data.comparison.currentMonthRevenue}
                previousValue={data.comparison.previousMonthRevenue}
                label="Ingresos"
                colorClass="bg-emerald-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--on-surface-variant)] font-medium">Pedidos</span>
                <span className={`font-bold ${data.comparison.ordersChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.comparison.ordersChange >= 0 ? '+' : ''}{data.comparison.ordersChange.toFixed(1)}%
                </span>
              </div>
              <ComparisonBar 
                currentValue={data.comparison.currentMonthOrders}
                previousValue={data.comparison.previousMonthOrders}
                label="Pedidos"
                format="number"
                colorClass="bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Pedidos Recientes</CardTitle>
            <Button variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary)]/80" asChild>
              <Link href="/pedidos">Ver Todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.length > 0 ? data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--outline-variant)]/30 hover:bg-[var(--surface-container-low)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--outline-variant)]/30 flex items-center justify-center text-[var(--on-surface-variant)] font-medium">
                      {order.customerName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--on-surface)]">{order.orderNumber}</p>
                      <p className="text-xs text-[var(--on-surface-variant)]">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--on-surface)]">${order.totalAmount.toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'COMPLETED' || order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-[var(--outline)]">No hay pedidos recientes</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Top 5 Productos</CardTitle>
            <Button variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary)]/80" asChild>
              <Link href="/reportes">Ver Reportes</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProducts.length > 0 ? data.topProducts.map((item, index) => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--outline-variant)]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-container)] flex items-center justify-center text-[var(--on-primary-container)] font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--outline-variant)]/30">
                      {item.product?.mainImage ? (
                        <Image 
                          src={item.product.mainImage} 
                          alt={`Imagen de ${item.product.name}`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--surface-container-low)] flex items-center justify-center">
                          <Package className="w-5 h-5 text-[var(--outline)]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--on-surface)] truncate max-w-[150px]">{item.product?.name || 'Producto'}</p>
                      <p className="text-xs text-[var(--on-surface-variant)]">{item._sum.quantity} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--on-surface)]">${item._sum.subtotal.toFixed(2)}</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">Ingresos</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-[var(--outline)]">No hay datos de ventas</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.lowStockProducts.length > 0 && (
        <Card className="border-[var(--error)]/30 overflow-hidden shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-[var(--error-container)]/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
              <CardTitle className="text-lg font-heading font-semibold text-[var(--error)]">Alertas de Stock Crítico</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error-container)]/20" asChild>
              <Link href="/inventario">Ver Inventario</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data.lowStockProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="p-4 border border-[var(--error)]/10 rounded-xl bg-[var(--error-container)]/5 hover:bg-[var(--error-container)]/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--outline-variant)]/30 flex-shrink-0">
                      {product.mainImage ? (
                        <Image 
                          src={product.mainImage} 
                          alt={`Imagen de ${product.name}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--surface-container-low)] flex items-center justify-center">
                          <Package className="w-6 h-6 text-[var(--outline)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--on-surface)] truncate">{product.name}</p>
                      <p className="text-xs text-[var(--outline)] font-mono">SKU: {product.sku}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-[var(--on-error-container)] bg-[var(--error-container)] px-2 py-0.5 rounded uppercase tracking-wider">
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-4 text-xs h-8 rounded-lg" asChild>
                    <Link href={`/productos?edit=${product.id}`}>
                      <Edit3 className="w-3 h-3 mr-1.5" /> Editar
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
