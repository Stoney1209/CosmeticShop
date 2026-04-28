import { Card, CardContent } from "@/components/ui/card";
import { getReportsData } from "@/app/actions/reports";
import { ReportsClient } from "./ReportsClient";

export const metadata = { title: "Reportes | Admin" };

export default async function ReportsPage() {
  const data = await getReportsData();
  
  // Serialize
  const sData = {
    recentOrders: data.recentOrders.map(o => ({ ...o, totalAmount: Number(o.totalAmount) })),
    bestSellers: data.bestSellers.map(b => ({ ...b, subtotal: Number(b._sum.subtotal || 0), quantity: b._sum.quantity || 0, productId: b.productId, productName: b.productName }))
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
