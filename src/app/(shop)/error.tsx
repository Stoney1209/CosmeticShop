"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Shop error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-heading font-bold text-slate-900 mb-3">
          Algo salió mal
        </h2>
        
        <p className="text-slate-600 mb-2">
          Lo sentimos, ha ocurrido un error al cargar esta página.
        </p>
        
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={reset}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/"}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
