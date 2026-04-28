"use client";

import { useState } from "react";
import { Plus, Trash2, Ticket, Calendar, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createCoupon, deleteCoupon, toggleCouponStatus } from "@/app/actions/coupons";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CouponsClient({ initialCoupons }: { initialCoupons: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    value: 0,
    minAmount: 0,
    expiryDate: "",
    usageLimit: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createCoupon({
        ...formData,
        minAmount: formData.minAmount || undefined,
        usageLimit: formData.usageLimit || undefined,
        expiryDate: formData.expiryDate || undefined
      });
      setCoupons([result, ...coupons]);
      setIsOpen(false);
      setFormData({ code: "", discountType: "PERCENTAGE", value: 0, minAmount: 0, expiryDate: "", usageLimit: 0 });
      toast.success("Cupón creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el cupón");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    try {
      await deleteCoupon(id);
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success("Cupón eliminado");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await toggleCouponStatus(id, !currentStatus);
      setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Cupones</h1>
          <p className="text-muted-foreground mt-1">Crea y administra códigos de descuento para tu tienda.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cupón</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Código del Cupón</label>
                <Input 
                  required 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="EJ: VERANO20" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tipo</label>
                  <select 
                    className="w-full h-10 px-3 border rounded-md"
                    value={formData.discountType}
                    onChange={e => setFormData({...formData, discountType: e.target.value})}
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto Fijo ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Valor</label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.value} 
                    onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Monto Mínimo de Compra ($)</label>
                <Input 
                  type="number" 
                  value={formData.minAmount} 
                  onChange={e => setFormData({...formData, minAmount: parseFloat(e.target.value)})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Fecha de Expiración</label>
                <Input 
                  type="date" 
                  value={formData.expiryDate} 
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
                />
              </div>

              <Button type="submit" className="w-full bg-pink-600">Guardar Cupón</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-bold text-pink-600">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discountType === "PERCENTAGE" ? `${coupon.value}%` : `$${coupon.value}`}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "Nunca"}
                  </TableCell>
                  <TableCell>{coupon.usageCount} / {coupon.usageLimit || "∞"}</TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Activo" : "Pausado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleToggle(coupon.id, coupon.isActive)}>
                      {coupon.isActive ? <Ban className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No hay cupones creados aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
