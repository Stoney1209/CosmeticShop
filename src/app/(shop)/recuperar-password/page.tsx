"use client";

import { useState } from "react";
import { requestPasswordReset, resetPassword } from "@/app/actions/customer-auth";
import Link from "next/link";

export default function RecuperarPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
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
      // En desarrollo, mostramos el token directamente
      if (result.resetToken) {
        setToken(result.resetToken);
        setStep("reset");
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === "request" ? "Recuperar Contraseña" : "Restablecer Contraseña"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === "request" 
              ? "Ingresa tu correo para recibir el enlace de recuperación"
              : "Ingresa tu nueva contraseña"
            }
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === "request" ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>

            <div className="text-center">
              <Link href="/cuenta/ingresar" className="text-indigo-600 hover:text-indigo-500">
                Volver a iniciar sesión
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                Token de recuperación
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Pega el token recibido"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Restablecer contraseña"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep("request")}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Volver a solicitar token
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
