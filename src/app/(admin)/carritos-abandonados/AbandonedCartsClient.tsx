"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ShoppingCart } from "lucide-react";

interface AbandonedCart {
  id: number;
  customerId: number | null;
  totalAmount: string;
  emailSent: boolean;
  emailSentAt: Date | null;
  recovered: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
}

interface AbandonedCartsClientProps {
  initialCarts: AbandonedCart[];
}

export function AbandonedCartsClient({ initialCarts }: AbandonedCartsClientProps) {
  const [carts, setCarts] = useState(initialCarts);

  const handleSendEmail = async (cartId: number) => {
    const response = await fetch("/api/admin/abandoned-carts/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId }),
    });

    if (response.ok) {
      setCarts(carts.map(c => 
        c.id === cartId ? { ...c, emailSent: true, emailSentAt: new Date() } : c
      ));
    }
  };

  if (carts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500">
            No hay carritos abandonados pendientes de recuperación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {carts.map((cart) => (
        <div key={cart.id} className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {cart.customer?.fullName || "Cliente anónimo"}
              </p>
              <p className="text-sm text-slate-500">
                {cart.customer?.email || "Sin email"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Total: ${Number(cart.totalAmount).toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Última actividad: {new Date(cart.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={cart.recovered ? "default" : "secondary"}>
                {cart.recovered ? "Recuperado" : "Pendiente"}
              </Badge>
              {cart.emailSent && (
                <Badge variant="outline">
                  Email enviado {cart.emailSentAt && new Date(cart.emailSentAt).toLocaleDateString()}
                </Badge>
              )}
              {!cart.emailSent && !cart.recovered && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendEmail(cart.id)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar correo
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
