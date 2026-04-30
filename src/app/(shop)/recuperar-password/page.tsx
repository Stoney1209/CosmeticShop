"use client";

import { useState, useEffect, Suspense } from "react";
import { requestPasswordReset, resetPassword } from "@/app/actions/customer-auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, ArrowLeft, Lock, Mail } from "lucide-react";

function PasswordResetContent() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");
  
  const [step, setStep] = useState<"request" | "reset">(urlToken ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(urlToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await requestPasswordReset(email);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Revisa tu correo para el enlace de recuperación" });
    } else {
      setMessage({ type: "error", text: result.error || "Error al solicitar recuperación" });
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await resetPassword({ token, newPassword });

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Contraseña actualizada correctamente" });
      setTimeout(() => {
        window.location.href = "/cuenta/ingresar";
      }, 2000);
    } else {
      setMessage({ type: "error", text: result.error || "Error al restablecer contraseña" });
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
              <Lock className="h-6 w-6 text-pink-600" />
            </div>
            <CardTitle className="text-2xl">
              {step === "request" ? "Recuperar Contraseña" : "Restablecer Contraseña"}
            </CardTitle>
            <CardDescription>
              {step === "request" 
                ? "Ingresa tu correo para recibir el enlace de recuperación"
                : "Crea una nueva contraseña segura"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {step === "request" ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-600 hover:bg-pink-700 h-11"
                >
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>

                <Link 
                  href="/cuenta/ingresar" 
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-pink-600 transition-colors mt-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token de recuperación</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Token del correo"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-slate-500">
                    El token se llena automáticamente desde el enlace del correo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-600 hover:bg-pink-700 h-11"
                >
                  {loading ? "Actualizando..." : "Restablecer contraseña"}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="w-full text-sm text-slate-500 hover:text-pink-600 transition-colors mt-4"
                >
                  ¿No recibiste el token? Solicitar de nuevo
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-pink-100 animate-pulse" />
              <div className="h-8 w-48 mx-auto bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-11 bg-slate-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <PasswordResetContent />
    </Suspense>
  );
}
