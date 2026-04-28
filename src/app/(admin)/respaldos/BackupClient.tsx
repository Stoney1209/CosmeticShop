"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";

export function BackupClient() {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch("/api/admin/backup/create", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Error al crear respaldo");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error creating backup:", error);
      alert("Error al crear respaldo");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <Button 
      className="w-full" 
      onClick={handleBackup}
      disabled={isBackingUp}
    >
      {isBackingUp ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Database className="mr-2 h-4 w-4" />
      )}
      {isBackingUp ? "Creando respaldo..." : "Crear Respaldo Ahora"}
    </Button>
  );
}
