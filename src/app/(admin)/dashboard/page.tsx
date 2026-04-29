import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Users, DollarSign, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | LUXE BEAUTÉ Admin",
};

export default async function DashboardPage() {
  // Fetch real data
  const [totalOrders, pendingOrders, completedOrdersRaw, recentOrders, newCustomers, lowStockProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: ["COMPLETED", "CONFIRMED"] } },
      _sum: { totalAmount: true }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.count(),
    prisma.product.count({
      where: {
        stock: { lte: 10 },
        isActive: true
      }
    })
  ]);

  const totalRevenue = Number(completedOrdersRaw._sum.totalAmount || 0);

  const stats = [
    {
      title: "TOTAL SALES",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+12.5% from last month",
      icon: DollarSign,
      trend: "up",
      color: "bg-[#7a5646]/10 text-[#7a5646]",
    },
    {
      title: "TOTAL ORDERS",
      value: totalOrders.toString(),
      change: "+4.2% from last month",
      icon: Package,
      trend: "up",
      color: "bg-[#695b58]/10 text-[#695b58]",
    },
    {
      title: "NEW CUSTOMERS",
      value: newCustomers.toString(),
      change: "+18% from last month",
      icon: Users,
      trend: "up",
      color: "bg-[#5e5e5c]/10 text-[#5e5e5c]",
    },
    {
      title: "STOCK ALERTS",
      value: lowStockProducts.toString(),
      change: "Items below threshold",
      icon: AlertTriangle,
      trend: lowStockProducts > 0 ? "down" : "up",
      color: lowStockProducts > 0 ? "bg-[#ba1a1a]/10 text-[#ba1a1a]" : "bg-[#5e5e5c]/10 text-[#5e5e5c]",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-heading font-medium text-[#1b1c1c]">Dashboard Overview</h2>
        <p className="text-[#82746e] mt-2">Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-luminous border-[#d4c3bc]/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="label-editorial text-[#82746e]">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-medium text-[#1b1c1c]">{stat.value}</div>
                <p className="text-xs text-[#82746e] mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 card-luminous border-[#d4c3bc]/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading text-[#1b1c1c]">Sales Overview</CardTitle>
            <select className="text-sm border border-[#d4c3bc]/30 rounded-lg px-3 py-1.5 bg-[#f6f3f2] text-[#1b1c1c] focus:outline-none focus:border-[#7a5646]">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center bg-[#f6f3f2]/50 rounded-lg border border-dashed border-[#d4c3bc]/30 m-6 mt-0">
            <p className="text-[#82746e] text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Charts require integration with third-party libraries (e.g., Recharts)
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 card-luminous border-[#d4c3bc]/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading text-[#1b1c1c]">Recent Orders</CardTitle>
            <a href="/pedidos" className="text-sm text-[#7a5646] hover:text-[#603f30] font-medium">View All</a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between group cursor-default py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f6f3f2] border border-[#d4c3bc]/30 flex items-center justify-center text-[#7a5646] font-medium transition-colors">
                      {order.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1b1c1c]">{order.orderNumber}</p>
                      <p className="text-xs text-[#82746e]">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#1b1c1c]">${Number(order.totalAmount).toFixed(2)}</p>
                    <p className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${
                      order.status === 'PENDING' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                      order.status === 'COMPLETED' || order.status === 'CONFIRMED' ? 'bg-[#10b981]/10 text-[#10b981]' :
                      order.status === 'CANCELLED' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                      'bg-[#3b82f6]/10 text-[#3b82f6]'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-[#82746e] text-sm">
                  No recent orders yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
