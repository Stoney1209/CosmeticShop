"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginCustomer, registerCustomer } from "@/app/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register";

export function CustomerAuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  const formSchema = isRegister
    ? z.object({
        fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        phone: z.string().optional(),
        email: z.string().email("Correo electrónico inválido"),
        password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
      })
    : z.object({
        email: z.string().email("Correo electrónico inválido"),
        password: z.string().min(1, "La contraseña es requerida"),
      });

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
    } as any,
  });

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
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values: any) => {
              setIsSubmitting(true);

              const result = isRegister
                ? await registerCustomer({ 
                    fullName: values.fullName as string, 
                    phone: values.phone as string, 
                    email: values.email, 
                    password: values.password 
                  })
                : await loginCustomer({ 
                    email: values.email, 
                    password: values.password 
                  });

              setIsSubmitting(false);

              if (!result.success) {
                toast.error(result.error);
                return;
              }

              toast.success(isRegister ? "Cuenta creada correctamente." : "Sesión iniciada.");
              router.push("/mi-cuenta");
              router.refresh();
            })}
          >
            {isRegister && (
              <>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Nombre completo *</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} value={field.value || ""} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Correo electrónico *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Contraseña *</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="h-11"
                      autoComplete={isRegister ? "new-password" : "current-password"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        </Form>

        {!isRegister && (
          <p className="mt-3 text-sm">
            <Link
              href="/recuperar-password"
              className="text-slate-500 hover:text-pink-600 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        )}
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

