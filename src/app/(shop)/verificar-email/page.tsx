"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setMessage("Token de verificación no proporcionado");
        return;
      }

      try {
        const response = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Correo verificado correctamente");
        } else {
          setStatus("error");
          setMessage(data.error || "Error al verificar el correo");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error de conexión. Intenta nuevamente.");
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Verificación de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
              <p className="text-slate-600">Verificando tu correo...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  ¡Verificación Exitosa!
                </h3>
                <p className="text-slate-600">{message}</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/tienda">Ir a la Tienda</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  Error de Verificación
                </h3>
                <p className="text-slate-600">{message}</p>
              </div>
              <div className="space-y-2 w-full">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/tienda">Ir a la Tienda</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/recuperar-password">Reenviar verificación</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Verificación de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
              <p className="text-slate-600">Cargando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerificarEmailContent />
    </Suspense>
  );
}
