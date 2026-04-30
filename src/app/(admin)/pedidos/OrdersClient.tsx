"use client";

import { useState, useEffect } from "react";
import { Eye, Truck, CheckCircle2, XCircle, Clock, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/actions/orders";

const statusConfig = {
  PENDING: { label: "Pendiente", color: "bg-amber-100 text-amber-800", icon: Clock },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  PROCESSING: { label: "En Proceso", color: "bg-purple-100 text-purple-800", icon: Truck },
  COMPLETED: { label: "Completado", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle }
};

export function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Apply filters
  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
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
  }, [orders, statusFilter, dateFrom, dateTo]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setIsStatusSubmitting(true);
    try {
      const result = await updateOrderStatus(id, newStatus as any);
      if (result.success) {
        toast.success("Estado del pedido actualizado");
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
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
    setIsDetailOpen(true);
  };

  return (
    <div>
      <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filtros:</span>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
            <SelectItem value="PROCESSING">En Proceso</SelectItem>
            <SelectItem value="COMPLETED">Completado</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px]"
          />
          <span className="text-slate-500">-</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px]"
          />
        </div>
        {(statusFilter !== "all" || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setDateFrom("");
              setDateTo("");
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead>Nº Pedido</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
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
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{order.customerName}</div>
                    <div className="text-xs text-slate-500">{order.customerPhone}</div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${statusConfig[order.status as keyof typeof statusConfig].color} border-transparent font-medium hover:opacity-80`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[order.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-pink-600" onClick={() => viewDetails(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Pedido {selectedOrder.orderNumber}</span>
                  <Badge className={`${statusConfig[selectedOrder.status as keyof typeof statusConfig].color}`}>
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900">Datos del Cliente</h4>
                  <p className="text-sm text-slate-600">{selectedOrder.customerName}</p>
                  <p className="text-sm text-slate-600">{selectedOrder.customerPhone}</p>
                  {selectedOrder.customerAddress && (
                    <p className="text-sm text-slate-600 mt-2">📍 {selectedOrder.customerAddress}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900">Cambiar Estado</h4>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}
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
                  {selectedOrder.status === "CANCELLED" && (
                    <p className="text-xs text-amber-600 font-medium">Cancelar restauró el stock automáticamente.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Productos ({selectedOrder.items.length})</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{item.quantity}x</span> {item.productName}
                        <div className="text-xs text-slate-400">SKU: {item.productSku}</div>
                      </div>
                      <div className="font-medium">${item.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-xl font-extrabold text-pink-600">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>

              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Historial de Estados</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedOrder.statusHistory.map((history: any, index: number) => (
                      <div key={history.id} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-pink-600 mt-1.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{statusConfig[history.status as keyof typeof statusConfig]?.label || history.status}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(history.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-xs text-slate-600 mt-1">{history.notes}</p>
                          )}
                          {history.changedBy && (
                            <p className="text-xs text-slate-500">por {history.changedBy}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
