import { Card, CardContent } from "@/components/ui/card";
import { getReportsData } from "@/app/actions/reports";
import { ReportsClient } from "./ReportsClient";

export const metadata = { title: "Reportes | Admin" };

export default async function ReportsPage() {
  const data = await getReportsData();
  
  // Serialize all data for client component
  const sData = {
    recentOrders: data.recentOrders.map((order: any) => ({ ...order, totalAmount: Number(order.totalAmount) })),
    bestSellers: data.bestSellers.map((bestSeller: any) => ({ 
      ...bestSeller, 
      _sum: {
        quantity: bestSeller._sum.quantity || 0,
        subtotal: Number(bestSeller._sum.subtotal || 0)
      },
      productId: bestSeller.productId, 
      productName: bestSeller.productName 
    })),
    today: {
      orders: data.today.orders,
      revenue: Number(data.today.revenue)
    },
    month: {
      orders: data.month.orders,
      revenue: Number(data.month.revenue)
    },
    totals: data.totals,
    ordersByStatus: data.ordersByStatus.map((item: any) => ({
      ...item,
      _sum: {
        totalAmount: Number(item._sum.totalAmount || 0)
      }
    })),
    recentCustomers: data.recentCustomers.map((customer: any) => ({
      ...customer,
      createdAt: customer.createdAt.toISOString()
    }))
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reportes Financieros</h2>
        <p className="text-slate-500">Analiza el rendimiento de tus ventas (Últimos 30 días).</p>
      </div>
      <Card><CardContent className="p-6"><ReportsClient data={sData} /></CardContent></Card>
    </div>
  );
}
