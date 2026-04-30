"use client";

import { useState, useEffect } from "react";
import { 
  Eye, Truck, CheckCircle2, XCircle, Clock, Calendar, Filter, Search, 
  MapPin, Phone, Mail, User, Package, ChevronRight, RotateCcw,
  StickyNote, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/actions/orders";
import { Card, CardContent } from "@/components/ui/card";

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
    <div>
      {/* Filters */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filtros:</span>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por Nº, cliente, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-72"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
            <span className="text-slate-500">-</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />
          </div>
          
          {/* Clear Filters */}
          {(statusFilter !== "all" || searchQuery || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="w-4 h-4 mr-1" /> Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="font-semibold">Nº Pedido</TableHead>
            <TableHead className="font-semibold">Fecha</TableHead>
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="text-right font-semibold">Total</TableHead>
            <TableHead className="text-center font-semibold">Estado</TableHead>
            <TableHead className="text-right font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                No hay pedidos que coincidan con los filtros.
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon;
              return (
                <TableRow key={order.id} className="group hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{order.orderNumber}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('es-MX', { 
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{order.customerName}</div>
                    <div className="text-xs text-slate-500">{order.customerPhone}</div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${statusConfig[order.status as keyof typeof statusConfig].color} border-transparent font-medium`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[order.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-slate-400 group-hover:text-pink-600" onClick={() => viewDetails(order)}>
                      <Eye className="w-4 h-4 mr-1" /> Ver
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>Pedido {selectedOrder.orderNumber}</span>
                    <Badge className={`${statusConfig[selectedOrder.status as keyof typeof statusConfig].color}`}>
                      {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <span className="text-sm text-slate-500 font-normal">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('es-MX', { 
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Timeline */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">Línea de Tiempo del Pedido</h4>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                      
                      <div className="space-y-4">
                        {statusFlow.map((status, index) => {
                          const timelineStatus = getTimelineStatus(selectedOrder.status, status);
                          const config = statusConfig[status as keyof typeof statusConfig];
                          const StatusIcon = config.icon;
                          const historyItem = selectedOrder.statusHistory?.find((h: any) => h.status === status);
                          
                          return (
                            <div key={status} className="flex items-start gap-4 relative">
                              {/* Status dot */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                                timelineStatus === 'completed' ? 'bg-emerald-500 text-white' :
                                timelineStatus === 'current' ? config.color.replace('bg-', 'bg-').replace('text-', 'text-white ') :
                                'bg-slate-200 text-slate-400'
                              }`}>
                                <StatusIcon className="w-4 h-4" />
                              </div>
                              
                              <div className="flex-1 pt-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${
                                    timelineStatus === 'pending' ? 'text-slate-400' : 'text-slate-900'
                                  }`}>
                                    {config.label}
                                  </span>
                                  {historyItem && (
                                    <span className="text-xs text-slate-500">
                                      {new Date(historyItem.createdAt).toLocaleString('es-MX', {
                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                      })}
                                    </span>
                                  )}
                                </div>
                                {historyItem?.notes && (
                                  <p className="text-sm text-slate-600 mt-1">{historyItem.notes}</p>
                                )}
                                {historyItem?.changedBy && (
                                  <p className="text-xs text-slate-400 mt-1">por {historyItem.changedBy}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {selectedOrder.status === 'CANCELLED' && (
                          <div className="flex items-start gap-4 relative">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center z-10 bg-red-500 text-white">
                              <XCircle className="w-4 h-4" />
                            </div>
                            <div className="flex-1 pt-1">
                              <span className="font-medium text-red-600">Cancelado</span>
                              {selectedOrder.statusHistory?.find((h: any) => h.status === 'CANCELLED') && (
                                <span className="text-xs text-slate-500 ml-2">
                                  {new Date(selectedOrder.statusHistory.find((h: any) => h.status === 'CANCELLED').createdAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4" /> Datos del Cliente
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900">{selectedOrder.customerName}</p>
                        {selectedOrder.customerEmail && (
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" /> {selectedOrder.customerEmail}
                          </p>
                        )}
                        {selectedOrder.customerPhone && (
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" /> {selectedOrder.customerPhone}
                          </p>
                        )}
                        {selectedOrder.customerAddress && (
                          <p className="text-sm text-slate-600 flex items-start gap-2 mt-3">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" /> 
                            <span>{selectedOrder.customerAddress}</span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Status Change */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-slate-900">Cambiar Estado</h4>
                      <Select 
                        value={selectedOrder.status} 
                        onValueChange={(val) => val && handleStatusChange(selectedOrder.id, val)}
                        disabled={isStatusSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Status Note */}
                      <div className="space-y-2">
                        <Label htmlFor="statusNote" className="text-xs flex items-center gap-1">
                          <StickyNote className="w-3 h-3" /> Nota (opcional)
                        </Label>
                        <Textarea
                          id="statusNote"
                          placeholder="Agregar nota sobre el cambio de estado..."
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Products */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Productos ({selectedOrder.items.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                            <p className="text-xs text-slate-500">SKU: {item.productSku}</p>
                            <p className="text-xs text-slate-500">{item.quantity} x ${item.unitPrice.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900">${item.subtotal.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium">${(selectedOrder.subtotal || selectedOrder.totalAmount - (selectedOrder.shipping || 0) + (selectedOrder.discount || 0)).toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Descuento</span>
                          <span className="font-medium text-emerald-600">-${selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedOrder.shipping > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Envío</span>
                          <span className="font-medium">${selectedOrder.shipping.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="text-xl font-bold text-pink-600">${selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Notes */}
                {selectedOrder.notes && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <StickyNote className="w-4 h-4" /> Notas del Pedido
                      </h4>
                      <p className="text-sm text-amber-800">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Label } from "@/components/ui/label";
