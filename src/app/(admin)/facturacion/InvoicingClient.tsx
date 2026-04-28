"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export function InvoicingClient() {
  const [settings, setSettings] = useState({
    rfc: "",
    businessName: "",
    regime: "",
    postalCode: "",
    email: "",
    pacApiKey: "",
    pacApiUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/invoicing/settings");
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/invoicing/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Configuración fiscal guardada exitosamente");
      } else {
        toast.error(data.error || "Error al guardar configuración");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar configuración");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rfc">RFC</Label>
          <Input
            id="rfc"
            value={settings.rfc}
            onChange={(e) => setSettings({ ...settings, rfc: e.target.value })}
            placeholder="XAXX010101000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Razón Social</Label>
          <Input
            id="businessName"
            value={settings.businessName}
            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
            placeholder="Nombre de tu empresa"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="regime">Régimen Fiscal</Label>
          <Input
            id="regime"
            value={settings.regime}
            onChange={(e) => setSettings({ ...settings, regime: e.target.value })}
            placeholder="601 - General de Ley Personas Morales"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Código Postal</Label>
          <Input
            id="postalCode"
            value={settings.postalCode}
            onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
            placeholder="00000"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email para notificaciones</Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            placeholder="facturacion@empresa.com"
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="mr-2 h-4 w-4" />
        )}
        {isSaving ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </form>
  );
}
