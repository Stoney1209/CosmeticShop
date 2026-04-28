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
import { MoreHorizontal, Eye, Ban, Check, Trash2 } from "lucide-react";

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

  return (
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
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleStatus(customer.id, customer.isActive)}>
                      {customer.isActive ? <Ban className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                      {customer.isActive ? "Desactivar" : "Activar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleVerification(customer.id, customer.isVerified)}>
                      <Check className="mr-2 h-4 w-4" />
                      {customer.isVerified ? "Desverificar" : "Verificar"}
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
  );
}
