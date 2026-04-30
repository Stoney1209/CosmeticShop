"use client";

import { useState, useEffect } from "react";
import { 
  Eye, Truck, CheckCircle2, XCircle, Clock, Calendar, Filter, Search, 
  MapPin, Phone, Mail, User, Package, RotateCcw,
  StickyNote
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/actions/orders";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS_LABELS } from "@/app/actions/dashboard";

const statusConfig = {
  PENDING: { label: "Pendiente", color: "bg-amber-100 text-amber-800", borderColor: "border-amber-500", icon: Clock },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-100 text-blue-800", borderColor: "border-blue-500", icon: CheckCircle2 },
  PROCESSING: { label: "En Proceso", color: "bg-purple-100 text-purple-800", borderColor: "border-purple-500", icon: Truck },
  SHIPPED: { label: "Enviado", color: "bg-indigo-100 text-indigo-800", borderColor: "border-indigo-500", icon: Truck },
  COMPLETED: { label: "Completado", color: "bg-emerald-100 text-emerald-800", borderColor: "border-emerald-500", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800", borderColor: "border-red-500", icon: XCircle }
};

const statusFlow = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED"];

export function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusNote, setStatusNote] = useState("");

  // Apply filters
  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerEmail?.toLowerCase().includes(query) ||
        o.customerPhone?.includes(query)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(dateFrom));
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(o => new Date(o.createdAt) <= endDate);
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery, dateFrom, dateTo]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setIsStatusSubmitting(true);
    try {
      const result = await updateOrderStatus(id, newStatus as any, statusNote);
      if (result.success) {
        toast.success("Estado del pedido actualizado");
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        setStatusNote("");
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Error al actualizar");
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  const viewDetails = (order: any) => {
    setSelectedOrder(order);
    setStatusNote("");
    setIsDetailOpen(true);
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
  };

  const getTimelineStatus = (orderStatus: string, timelineStatus: string) => {
    const orderIndex = statusFlow.indexOf(orderStatus);
    const timelineIndex = statusFlow.indexOf(timelineStatus);
    
    if (timelineIndex < orderIndex) return "completed";
    if (timelineIndex === orderIndex) return "current";
    return "pending";
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--outline-variant)]/30 shadow-sm overflow-hidden animate-fade-up">
      {/* Filters Bar */}
      <div className="p-6 border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-lowest)] space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-bold text-[var(--on-surface)] uppercase tracking-wider">Filtros Operativos</span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
            <Input
              placeholder="Buscar por Nº, cliente, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30 rounded-lg focus-visible:ring-[var(--primary)]/20"
              aria-label="Buscar pedidos"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-[180px] h-10 rounded-lg border-[var(--outline-variant)]/30">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-3 bg-[var(--surface-container-low)] p-1 rounded-lg border border-[var(--outline-variant)]/30">
            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-[var(--outline)]" />
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 h-8 border-none bg-transparent shadow-none focus-visible:ring-0 text-xs" aria-label="Fecha desde" />
              <span className="text-[var(--outline)] text-xs font-bold">—</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 h-8 border-none bg-transparent shadow-none focus-visible:ring-0 text-xs" aria-label="Fecha hasta" />
            </div>
          </div>
          
          {(statusFilter !== "all" || searchQuery || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] h-10">
              <RotateCcw className="w-4 h-4 mr-2" /> Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[var(--surface-container-low)]">
            <TableRow>
              <TableHead className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Nº Pedido</TableHead>
              <TableHead className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Fecha de Registro</TableHead>
              <TableHead className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Información del Cliente</TableHead>
              <TableHead className="text-right font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Total Venta</TableHead>
              <TableHead className="text-center font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Estado Actual</TableHead>
              <TableHead className="text-right font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px] pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-[var(--outline)] italic">
                  No se encontraron pedidos que coincidan con los criterios de búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const config = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                return (
                  <TableRow key={order.id} className="group hover:bg-[var(--surface-container-lowest)] transition-colors">
                    <TableCell className="font-bold text-[var(--on-surface)]">{order.orderNumber}</TableCell>
                    <TableCell className="text-[var(--on-surface-variant)] text-xs">
                      <div className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString('es-MX', { 
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-[var(--outline)]">
                        {new Date(order.createdAt).toLocaleTimeString('es-MX', { 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-[var(--on-surface)] text-sm">{order.customerName}</div>
                      <div className="text-[10px] font-medium text-[var(--outline)] tracking-wide">{order.customerPhone}</div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[var(--on-surface)]">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${config.color} border-none font-bold text-[9px] uppercase tracking-wider px-2 py-1`}>
                        <StatusIcon className="w-3 h-3 mr-1.5" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[var(--outline)] hover:text-[var(--primary)] group-hover:bg-[var(--primary-container)]/10 h-8 rounded-lg font-bold text-xs"
                        onClick={() => viewDetails(order)}
                        aria-label={`Ver detalles del pedido ${order.orderNumber}`}
                      >
                        <Eye className="w-4 h-4 mr-2" /> Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-2xl">
          {selectedOrder && (
            <div className="p-8">
              <DialogHeader className="mb-8">
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-[var(--primary-container)]/10 p-2 rounded-xl">
                      <Package className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-[var(--on-surface)]">Pedido {selectedOrder.orderNumber}</h2>
                      <Badge className={`${statusConfig[selectedOrder.status as keyof typeof statusConfig].color} border-none font-bold text-[10px] uppercase mt-1`}>
                        {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[var(--outline)] uppercase tracking-widest">Fecha de Registro</p>
                    <p className="text-sm font-medium text-[var(--on-surface-variant)]">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('es-MX', { 
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Timeline and Quick Actions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Timeline */}
                  <div className="lg:col-span-3">
                    <Card className="border-[var(--outline-variant)]/30 shadow-none bg-[var(--surface-container-lowest)] rounded-2xl">
                      <CardContent className="p-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)] mb-6">Historial de Estados</h4>
                        <div className="relative">
                          {/* Timeline vertical line */}
                          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-[var(--outline-variant)]/50" />
                          
                          <div className="space-y-6">
                            {statusFlow.map((status) => {
                              const timelineStatus = getTimelineStatus(selectedOrder.status, status);
                              const config = statusConfig[status as keyof typeof statusConfig];
                              const StatusIcon = config.icon;
                              const historyItem = selectedOrder.statusHistory?.find((h: any) => h.status === status);
                              
                              return (
                                <div key={status} className="flex items-start gap-5 relative">
                                  {/* Timeline dot */}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm transition-all duration-300 ${
                                    timelineStatus === 'completed' ? 'bg-emerald-500 text-white' :
                                    timelineStatus === 'current' ? 'bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/10' :
                                    'bg-[var(--surface-container-high)] text-[var(--outline)]'
                                  }`}>
                                    <StatusIcon className="w-4 h-4" />
                                  </div>
                                  
                                  <div className="flex-1 pt-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-sm font-bold uppercase tracking-wider ${
                                        timelineStatus === 'pending' ? 'text-[var(--outline)]' : 'text-[var(--on-surface)]'
                                      }`}>
                                        {config.label}
                                      </span>
                                      {historyItem && (
                                        <span className="text-[10px] font-bold text-[var(--outline)]">
                                          {new Date(historyItem.createdAt).toLocaleString('es-MX', {
                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                          })}
                                        </span>
                                      )}
                                    </div>
                                    {historyItem?.notes && (
                                      <div className="bg-white/50 border border-black/5 p-2 rounded-lg mt-2 italic text-xs text-[var(--on-surface-variant)]">
                                        "{historyItem.notes}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            
                            {selectedOrder.status === 'CANCELLED' && (
                              <div className="flex items-start gap-5 relative">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center z-10 bg-red-500 text-white shadow-lg ring-4 ring-red-100">
                                  <XCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 pt-0.5">
                                  <span className="text-sm font-bold uppercase tracking-wider text-red-600">Cancelado</span>
                                  <p className="text-[10px] text-[var(--outline)] font-bold">Pedido anulado</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Change Status Action */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-[var(--primary)]/20 shadow-md bg-[var(--surface-container-low)] rounded-2xl overflow-hidden">
                      <div className="h-1 bg-[var(--primary)] w-full" />
                      <CardContent className="p-6 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--on-surface)]">Gestión de Estado</h4>
                        <Select 
                          value={selectedOrder.status} 
                          onValueChange={(val) => val && handleStatusChange(selectedOrder.id, val)}
                          disabled={isStatusSubmitting}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-white border-[var(--outline-variant)]/30">
                            <SelectValue placeholder="Actualizar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key} className="font-medium">{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="space-y-2">
                          <Label htmlFor="statusNote" className="text-[10px] font-bold uppercase tracking-widest text-[var(--outline)] flex items-center gap-1.5">
                            <StickyNote className="w-3 h-3" /> Nota del movimiento
                          </Label>
                          <Textarea
                            id="statusNote"
                            placeholder="Escribe el motivo del cambio o detalles de seguimiento..."
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            rows={3}
                            className="text-xs rounded-xl border-[var(--outline-variant)]/30 bg-white"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Customer Quick Glance */}
                    <Card className="border-[var(--outline-variant)]/30 shadow-none rounded-2xl">
                      <CardContent className="p-6 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--on-surface)]">Datos de Entrega</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-[var(--surface-container-high)] p-2 rounded-lg">
                              <User className="w-4 h-4 text-[var(--primary)]" />
                            </div>
                            <span className="text-sm font-bold text-[var(--on-surface)]">{selectedOrder.customerName}</span>
                          </div>
                          {selectedOrder.customerPhone && (
                            <div className="flex items-center gap-3">
                              <div className="bg-[var(--surface-container-high)] p-2 rounded-lg">
                                <Phone className="w-4 h-4 text-[var(--primary)]" />
                              </div>
                              <span className="text-xs font-medium text-[var(--on-surface-variant)]">{selectedOrder.customerPhone}</span>
                            </div>
                          )}
                          {selectedOrder.customerAddress && (
                            <div className="flex items-start gap-3 mt-4 pt-4 border-t border-black/5">
                              <div className="bg-[var(--surface-container-high)] p-2 rounded-lg shrink-0">
                                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                              </div>
                              <span className="text-xs leading-relaxed text-[var(--on-surface-variant)] font-medium italic">
                                {selectedOrder.customerAddress}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Items Summary Table */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--primary)] px-2">Detalle de Productos</h4>
                  <div className="border border-[var(--outline-variant)]/30 rounded-2xl overflow-hidden bg-[var(--surface-container-lowest)]">
                    <Table>
                      <TableHeader className="bg-[var(--surface-container-low)]">
                        <TableRow>
                          <TableHead className="w-16"></TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Producto</TableHead>
                          <TableHead className="text-center text-[10px] font-bold uppercase">Cant.</TableHead>
                          <TableHead className="text-right text-[10px] font-bold uppercase">Precio Unit.</TableHead>
                          <TableHead className="text-right text-[10px] font-bold uppercase pr-6">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item: any) => (
                          <TableRow key={item.id} className="hover:bg-transparent">
                            <TableCell>
                              {/* P3: Optimized next/image */}
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]">
                                {item.productImage ? (
                                  <Image 
                                    src={item.productImage} 
                                    alt={`Imagen de ${item.productName}`}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-[var(--outline-variant)]" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-bold text-[var(--on-surface)]">{item.productName}</p>
                              <p className="text-[10px] font-mono text-[var(--outline)] uppercase">SKU: {item.productSku}</p>
                            </TableCell>
                            <TableCell className="text-center font-bold text-sm">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium text-[var(--on-surface-variant)]">
                              ${item.unitPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-sm text-[var(--on-surface)] pr-6">
                              ${item.subtotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Totals Summary Card */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-[350px] bg-[var(--surface-container-low)] p-6 rounded-2xl border border-[var(--outline-variant)]/30 space-y-4">
                    <div className="flex justify-between text-xs font-medium text-[var(--on-surface-variant)]">
                      <span>Subtotal</span>
                      <span className="font-bold text-[var(--on-surface)]">${(selectedOrder.totalAmount - (selectedOrder.shipping || 0) + (selectedOrder.discount || 0)).toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[var(--on-surface-variant)]">Descuentos</span>
                        <span className="font-bold text-emerald-600">-${selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.shipping > 0 && (
                      <div className="flex justify-between text-xs font-medium text-[var(--on-surface-variant)]">
                        <span>Gastos de Envío</span>
                        <span className="font-bold text-[var(--on-surface)]">${selectedOrder.shipping.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                      <span className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--on-surface)]">Monto Total</span>
                      <span className="text-3xl font-heading font-bold text-[var(--primary)]">${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Extra Notes alert */}
                {selectedOrder.notes && (
                  <div className="bg-[var(--primary-container)]/10 border border-[var(--primary-container)]/20 p-5 rounded-2xl flex gap-3">
                    <StickyNote className="w-5 h-5 text-[var(--primary)] shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">Nota del Cliente / Operativa</p>
                      <p className="text-sm text-[var(--on-primary-container)] italic leading-relaxed">"{selectedOrder.notes}"</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-center border-t border-black/5 pt-8">
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="rounded-full px-12 h-12 font-bold text-xs uppercase tracking-[0.15em]">
                  Cerrar Visualización
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
