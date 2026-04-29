"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { loginCustomer, registerCustomer } from "@/app/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register";

export function CustomerAuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle>{isRegister ? "Crea tu cuenta" : "Ingresa a tu cuenta"}</CardTitle>
        <CardDescription>
          {isRegister
            ? "Guarda tus pedidos y tus productos favoritos."
            : "Consulta tus pedidos y administra tu perfil."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSubmitting(true);

            const result = isRegister
              ? await registerCustomer({ fullName, phone, email, password })
              : await loginCustomer({ email, password });

            setIsSubmitting(false);

            if (!result.success) {
              toast.error(result.error);
              return;
            }

            toast.success(isRegister ? "Cuenta creada correctamente." : "Sesión iniciada.");
            router.push("/mi-cuenta");
            router.refresh();
          }}
        >
          {isRegister && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo *</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
              autoocomplete={isRegister ? "new-password" : "current-password"}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 text-white hover:bg-pink-700">
            {isSubmitting
              ? isRegister
                ? "Creando cuenta..."
                : "Ingresando..."
              : isRegister
                ? "Crear cuenta"
                : "Ingresar"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          {isRegister ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
          <Link
            href={isRegister ? "/cuenta/ingresar" : "/cuenta/registro"}
            className="font-semibold text-pink-600 hover:text-pink-700"
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

