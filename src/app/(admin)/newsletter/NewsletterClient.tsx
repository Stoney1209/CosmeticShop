"use client";

import { useState } from "react";
import { Trash2, Download, Mail, Users, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { toggleSubscriberStatus, deleteSubscriber, exportSubscribers } from "@/app/actions/newsletter";

export function NewsletterClient({ initialSubscribers, stats }: { initialSubscribers: any[], stats: any }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const result = await toggleSubscriberStatus(id, !currentStatus);
    if (result.success) {
      setSubscribers(subscribers.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      toast.success("Estado actualizado");
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este suscriptor?")) return;
    const result = await deleteSubscriber(id);
    if (result.success) {
      setSubscribers(subscribers.filter(s => s.id !== id));
      toast.success("Suscriptor eliminado");
    } else {
      toast.error(result.error);
    }
  };

  const handleExport = async () => {
    const result = await exportSubscribers();
    if (result.success && result.csv) {
      const blob = new Blob([result.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "newsletter_subscribers.csv";
      a.click();
      toast.success("Suscriptores exportados");
    } else {
      toast.error(result.error || "Error al exportar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Total Suscriptores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.total}</div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Suscriptores Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.active}</div>
              <CheckCircle2 className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Nuevos (30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.recent}</div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-pink-600" />
            Lista de Suscriptores
          </CardTitle>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Suscripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    No hay suscriptores registrados.
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {subscriber.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(subscriber.createdAt).toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(subscriber.id, subscriber.isActive)}
                        title={subscriber.isActive ? "Desactivar" : "Activar"}
                      >
                        {subscriber.isActive ? (
                          <XCircle className="h-4 w-4 text-slate-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(subscriber.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
