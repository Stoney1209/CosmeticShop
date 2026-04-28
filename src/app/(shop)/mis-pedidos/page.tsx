import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Mis pedidos | Cosmetics Shop",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export default async function MyOrdersPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/cuenta/ingresar");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mis pedidos</h1>
        <p className="mt-2 text-slate-500">Aquí puedes consultar tus compras registradas.</p>
      </div>

      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString("es-MX")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{statusLabels[order.status] ?? order.status}</Badge>
                  <p className="mt-2 text-lg font-bold text-slate-900">${Number(order.totalAmount).toFixed(2)}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{item.productName}</p>
                      <p className="text-slate-500">SKU: {item.productSku}</p>
                    </div>
                    <div className="text-right text-slate-600">
                      <p>{item.quantity} x ${Number(item.unitPrice).toFixed(2)}</p>
                      <p className="font-semibold text-slate-900">${Number(item.subtotal).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              Aún no tienes pedidos asociados a tu cuenta.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

