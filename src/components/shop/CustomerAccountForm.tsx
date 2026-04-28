"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateCustomerProfile, logoutCustomer } from "@/app/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerAccountForm({
  customer,
}: {
  customer: { fullName: string; email: string; phone: string | null };
}) {
  const [fullName, setFullName] = useState(customer.fullName);
  const [phone, setPhone] = useState(customer.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <div className="space-y-8">
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSaving(true);
          const result = await updateCustomerProfile({ fullName, phone });
          setIsSaving(false);

          if (!result.success) {
            toast.error(result.error);
            return;
          }

          toast.success("Perfil actualizado.");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" value={customer.email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button type="submit" disabled={isSaving} className="bg-slate-900 text-white hover:bg-slate-800">
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-6">
        <Button
          variant="outline"
          disabled={isLoggingOut}
          onClick={async () => {
            setIsLoggingOut(true);
            await logoutCustomer();
            window.location.href = "/";
          }}
        >
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </Button>
      </div>
    </div>
  );
}

