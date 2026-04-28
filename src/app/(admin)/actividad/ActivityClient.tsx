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
import { Trash2 } from "lucide-react";

interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string | null;
  ipAddress: string;
  username: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
  } | null;
}

interface ActivityClientProps {
  initialLogs: ActivityLog[];
}

export function ActivityClient({ initialLogs }: ActivityClientProps) {
  const [logs, setLogs] = useState(initialLogs);

  const handleClearLogs = async () => {
    if (!confirm("¿Estás seguro de limpiar todos los logs de actividad?")) return;

    const response = await fetch("/api/admin/activity/clear", {
      method: "POST",
    });

    if (response.ok) {
      setLogs([]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">Total de registros: {logs.length}</p>
        <Button variant="destructive" size="sm" onClick={handleClearLogs}>
          <Trash2 className="mr-2 h-4 w-4" />
          Limpiar logs
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Acción</TableHead>
            <TableHead>Entidad</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.action}</TableCell>
              <TableCell>
                {log.entityType && log.entityId ? (
                  <Badge variant="outline">{log.entityType} #{log.entityId}</Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {log.user ? (
                  <div>
                    <div className="font-medium">{log.user.fullName}</div>
                    <div className="text-xs text-slate-500">@{log.user.username}</div>
                  </div>
                ) : (
                  <span className="text-slate-500">{log.username}</span>
                )}
              </TableCell>
              <TableCell className="text-sm">{log.ipAddress}</TableCell>
              <TableCell className="text-sm max-w-xs truncate">{log.description || "-"}</TableCell>
              <TableCell className="text-sm">
                {new Date(log.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
