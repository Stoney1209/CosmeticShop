"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Mail, Shield } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-up">
      <div className="bg-[var(--surface-container-low)] p-6 rounded-2xl border border-[var(--outline-variant)]/30 space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--outline-variant)]/20 pb-4">
          <FileText className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-heading font-bold text-[var(--on-surface)]">Datos Fiscales del Emisor</h3>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rfc" className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">RFC</Label>
            <Input
              id="rfc"
              value={settings.rfc}
              onChange={(e) => setSettings({ ...settings, rfc: e.target.value })}
              placeholder="XAXX010101000"
              className="h-11 rounded-xl bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Razón Social</Label>
            <Input
              id="businessName"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              placeholder="Nombre legal de la empresa"
              className="h-11 rounded-xl bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regime" className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Régimen Fiscal</Label>
            <Input
              id="regime"
              value={settings.regime}
              onChange={(e) => setSettings({ ...settings, regime: e.target.value })}
              placeholder="Ej: 601 - General de Ley Personas Morales"
              className="h-11 rounded-xl bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Código Postal</Label>
            <Input
              id="postalCode"
              value={settings.postalCode}
              onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
              placeholder="00000"
              className="h-11 rounded-xl bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface-container-low)] p-6 rounded-2xl border border-[var(--outline-variant)]/30 space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--outline-variant)]/20 pb-4">
          <Mail className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-heading font-bold text-[var(--on-surface)]">Notificaciones</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Email para recepción de facturas y avisos</Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            placeholder="facturacion@cosmeticshop.com"
            className="h-11 rounded-xl bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20"
            required
          />
        </div>
      </div>

      <div className="bg-[var(--surface-container-low)] p-6 rounded-2xl border border-[var(--outline-variant)]/30 space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--outline-variant)]/20 pb-4">
          <Shield className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-heading font-bold text-[var(--on-surface)]">Conexión con PAC (Timbrado)</h3>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pacApiUrl" className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">URL de la API del PAC</Label>
            <Input
              id="pacApiUrl"
              value={settings.pacApiUrl}
              onChange={(e) => setSettings({ ...settings, pacApiUrl: e.target.value })}
              placeholder="https://api.pac.com/v1"
              className="h-11 rounded-xl bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20 font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pacApiKey" className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">PAC API Key / Token</Label>
            <Input
              id="pacApiKey"
              type="password"
              value={settings.pacApiKey}
              onChange={(e) => setSettings({ ...settings, pacApiKey: e.target.value })}
              placeholder="••••••••••••••••"
              className="h-11 rounded-xl bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20"
            />
          </div>
        </div>
        <p className="text-[10px] text-[var(--outline)] italic italic">
          * Estos datos son sensibles y se utilizan para la comunicación encriptada con el proveedor de certificación.
        </p>
      </div>

      <Button type="submit" disabled={isSaving} className="w-full bg-[var(--primary)] text-white h-12 rounded-xl font-bold shadow-lg hover:bg-[var(--primary)]/90 transition-all">
        {isSaving ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <FileText className="mr-2 h-5 w-5" />
        )}
        {isSaving ? "Guardando cambios..." : "Actualizar Configuración Fiscal"}
      </Button>
    </form>
  );
}
