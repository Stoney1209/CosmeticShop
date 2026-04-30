import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";
import { Eye } from "lucide-react";

export const metadata = {
  title: "Mis Pedidos | Cosmetics Shop",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
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
    <div className="space-y-6">
      {orders.length > 0 ? (
        orders.map((order: any) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("es-MX", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <Badge className={statusColors[order.status] ?? "bg-slate-100"}>
                  {statusLabels[order.status] ?? order.status}
                </Badge>
                <p className="mt-2 text-lg font-bold text-slate-900">${Number(order.totalAmount).toFixed(2)}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 rounded-full border-slate-300 hover:border-pink-400 hover:text-pink-600"
                  asChild
                >
                  <Link href={`/pedidos/${order.id}`} className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    Ver Detalle
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {order.items.slice(0, 2).map((item: any) => (
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
              {order.items.length > 2 && (
                <p className="text-sm text-slate-500 text-center">
                  +{order.items.length - 2} productos más...
                </p>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 mb-4">Aún no tienes pedidos asociados a tu cuenta.</p>
            <Button asChild className="bg-pink-600 hover:bg-pink-700">
              <Link href="/tienda">Explorar productos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

