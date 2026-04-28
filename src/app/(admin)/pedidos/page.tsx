import { Card, CardContent } from "@/components/ui/card";
import { getOrders } from "@/app/actions/orders";
import { OrdersClient } from "./OrdersClient";

export const metadata = {
  title: "Pedidos | Cosmetics Admin",
};

export default async function OrdersPage() {
  const orders = await getOrders();
  
  // Serialize Decimals
  const serializedOrders = orders.map(o => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    items: o.items.map(i => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal)
    }))
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pedidos</h2>
          <p className="text-slate-500 mt-2">Gestiona las órdenes de compra y su estado.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <OrdersClient initialOrders={serializedOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
