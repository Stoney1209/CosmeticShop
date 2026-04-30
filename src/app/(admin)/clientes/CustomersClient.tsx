"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, Eye, Ban, Check, Trash2, ShoppingBag, Mail, Phone, Calendar, Key } from "lucide-react";

interface Customer {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  _count: {
    orders: number;
    wishlist: number;
    reviews: number;
  };
}

interface CustomersClientProps {
  initialCustomers: Customer[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const response = await fetch("/api/admin/customers/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !currentStatus }),
    });

    if (response.ok) {
      setCustomers(customers.map(c => 
        c.id === id ? { ...c, isActive: !currentStatus } : c
      ));
    }
  };

  const handleToggleVerification = async (id: number, currentStatus: boolean) => {
    const response = await fetch("/api/admin/customers/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isVerified: !currentStatus }),
    });

    if (response.ok) {
      setCustomers(customers.map(c => 
        c.id === id ? { ...c, isVerified: !currentStatus } : c
      ));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;

    const response = await fetch("/api/admin/customers/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const viewDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleResetPassword = async (id: number) => {
    if (!confirm("¿Enviar email de restablecimiento de contraseña a este cliente?")) return;

    try {
      const response = await fetch("/api/admin/customers/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        alert("Email de restablecimiento enviado exitosamente");
      } else {
        alert("Error al enviar email de restablecimiento");
      }
    } catch {
      alert("Error al enviar email de restablecimiento");
    }
  };

  return (
    <>
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Verificado</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.fullName}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || "-"}</TableCell>
                <TableCell>{customer._count.orders}</TableCell>
                <TableCell>
                  <Badge variant={customer.isActive ? "default" : "secondary"}>
                    {customer.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.isVerified ? "default" : "outline"}>
                    {customer.isVerified ? "Verificado" : "No verificado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(customer.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewDetails(customer)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(customer.id, customer.isActive)}>
                        {customer.isActive ? <Ban className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                        {customer.isActive ? "Desactivar" : "Activar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleVerification(customer.id, customer.isVerified)}>
                        <Check className="mr-2 h-4 w-4" />
                        {customer.isVerified ? "Desverificar" : "Verificar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(customer.id)}>
                        <Key className="mr-2 h-4 w-4" />
                        Resetear Contraseña
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Perfil del Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Nombre</p>
                    <p className="text-base font-semibold text-slate-900">{selectedCustomer.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Email</p>
                    <p className="text-base text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {selectedCustomer.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Teléfono</p>
                    <p className="text-base text-slate-900 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedCustomer.phone || "No registrado"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Registrado</p>
                    <p className="text-base text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Pedidos</p>
                    <p className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      {selectedCustomer._count.orders}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Wishlist</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedCustomer._count.wishlist}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Reseñas</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedCustomer._count.reviews}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant={selectedCustomer.isActive ? "default" : "secondary"}>
                    {selectedCustomer.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <Badge variant={selectedCustomer.isVerified ? "default" : "outline"}>
                    {selectedCustomer.isVerified ? "Verificado" : "No verificado"}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
