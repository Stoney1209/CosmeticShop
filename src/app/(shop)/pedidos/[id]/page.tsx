import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Phone,
  FileText
} from "lucide-react";

export const metadata = {
  title: "Detalle de Pedido | Cosmetics Shop",
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

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-5 w-5" />,
  CONFIRMED: <CheckCircle className="h-5 w-5" />,
  PROCESSING: <Package className="h-5 w-5" />,
  COMPLETED: <Truck className="h-5 w-5" />,
  CANCELLED: <XCircle className="h-5 w-5" />,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/cuenta/ingresar");
  }

  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: { 
      id: orderId,
      customerId: session.id 
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              mainImage: true,
              slug: true,
            }
          }
        }
      },
      statusHistory: {
        orderBy: { createdAt: "asc" }
      }
    },
  });

  if (!order) {
    notFound();
  }

  // Build timeline from status history or generate default
  const timeline = order.statusHistory.length > 0 
    ? order.statusHistory.map((h, index) => ({
        status: h.status,
        label: statusLabels[h.status] || h.status,
        date: h.createdAt,
        description: h.notes || getDefaultStatusDescription(h.status),
        completed: true,
        isCurrent: index === order.statusHistory.length - 1,
      }))
    : generateDefaultTimeline(order.status, order.createdAt);

  function getDefaultStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      PENDING: "Pedido recibido, esperando confirmación",
      CONFIRMED: "Pedido confirmado por el equipo",
      PROCESSING: "Preparando tu pedido para envío",
      COMPLETED: "Pedido entregado exitosamente",
      CANCELLED: "Pedido cancelado",
    };
    return descriptions[status] || "";
  }

  function generateDefaultTimeline(currentStatus: string, createdAt: Date) {
    const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED"];
    const currentIndex = statuses.indexOf(currentStatus);
    
    return statuses.map((status, index) => ({
      status,
      label: statusLabels[status],
      date: index === 0 ? createdAt : new Date(createdAt.getTime() + index * 24 * 60 * 60 * 1000),
      description: getDefaultStatusDescription(status),
      completed: index <= currentIndex || currentStatus === "COMPLETED",
      isCurrent: status === currentStatus,
    }));
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mis-pedidos" className="mb-4 -ml-4 inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent hover:bg-surface-container-low hover:text-on-surface text-sm font-medium whitespace-nowrap transition-all h-9 gap-1.5 px-4 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Volver a mis pedidos
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pedido {order.orderNumber}</h1>
            <p className="mt-1 text-slate-500">
              Realizado el {new Date(order.createdAt).toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Badge className={`${statusColors[order.status]} px-4 py-2 text-sm font-medium w-fit`}>
            {statusIcons[order.status]}
            <span className="ml-2">{statusLabels[order.status]}</span>
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left Column - Timeline & Products */}
        <div className="space-y-8">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                Seguimiento del pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                
                <div className="space-y-6">
                  {timeline.map((step, index) => (
                    <div key={index} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        step.isCurrent 
                          ? "border-pink-500 bg-pink-50 text-pink-600" 
                          : step.completed 
                            ? "border-green-500 bg-green-50 text-green-600"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <p className={`font-medium ${
                          step.isCurrent ? "text-pink-700" : step.completed ? "text-slate-900" : "text-slate-400"
                        }`}>
                          {step.label}
                          {step.isCurrent && (
                            <span className="ml-2 text-xs font-normal text-pink-600">(Actual)</span>
                          )}
                        </p>
                        <p className={`text-sm ${
                          step.completed ? "text-slate-600" : "text-slate-400"
                        }`}>
                          {step.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(step.date).toLocaleString("es-MX", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-slate-500" />
                Productos ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-xl border border-slate-100 p-4">
                  {/* Product Image */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {item.product?.mainImage ? (
                      <img 
                        src={item.product.mainImage} 
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-2">{item.productName}</p>
                        <p className="text-sm text-slate-500">SKU: {item.productSku}</p>
                        {item.product && (
                          <Link 
                            href={`/producto/${item.product.slug}`}
                            className="text-xs text-pink-600 hover:text-pink-700 mt-1 inline-block"
                          >
                            Ver producto →
                          </Link>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          ${Number(item.subtotal).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {item.quantity} x ${Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">
                  ${(Number(order.totalAmount) + Number(order.discountAmount)).toFixed(2)}
                </span>
              </div>
              
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Descuento</span>
                  <span className="font-medium text-green-600">
                    -${Number(order.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
              
              {order.couponCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Cupón aplicado</span>
                  <Badge variant="outline" className="text-xs">
                    {order.couponCode}
                  </Badge>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-slate-900">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CreditCard className="h-4 w-4" />
                <span>Pago por transferencia</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Información de contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">{order.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-600">{order.customerPhone}</p>
                </div>
              </div>
              
              {order.customerEmail && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-600">{order.customerEmail}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.customerAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección de envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                  <p className="text-slate-600">{order.customerAddress}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/tienda" className="flex-1 inline-flex items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap transition-all hover:bg-primary/90 shadow-sm h-9 gap-1.5 px-4 bg-pink-600 hover:bg-pink-700">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
