"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin panel error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-heading font-bold text-[var(--on-surface)] mb-3">
          Error en el Panel Administrativo
        </h2>
        
        <p className="text-[var(--on-surface-variant)] mb-2">
          Ha ocurrido un error al cargar esta sección del panel.
        </p>
        
        {error.digest && (
          <p className="text-xs text-[var(--outline)] mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={reset}
            className="gap-2 bg-[var(--primary)] hover:bg-[var(--on-primary-container)]"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/dashboard"}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
