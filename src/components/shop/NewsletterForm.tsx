"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

interface NewsletterFormProps {
  /** Visual variant: "hero" for the large homepage section, "footer" for compact footer */
  variant?: "hero" | "footer";
}

export function NewsletterForm({ variant = "hero" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const result = await subscribeToNewsletter(email);
      if (result.success) {
        setStatus("success");
        setMessage(result.message || "¡Suscripción exitosa!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(result.error || "Error al suscribirse");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión");
    }
  };

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} aria-label="Suscripción al newsletter">
        <label htmlFor="footer-newsletter-email" className="sr-only">Correo electrónico</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="footer-newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }}
            placeholder="Tu correo electrónico"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-[var(--outline-variant)]/30 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            disabled={status === "loading"}
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="px-5 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--on-primary-container)] text-[var(--on-primary)] text-sm font-medium transition-colors"
          >
            {status === "loading" ? "..." : "UNIRSE"}
          </Button>
        </div>
        {status !== "idle" && (
          <p
            role="status"
            aria-live="polite"
            className={`text-xs mt-2 font-medium ${status === "success" ? "text-green-700" : "text-[var(--error)]"}`}
          >
            {message}
          </p>
        )}
      </form>
    );
  }

  // Hero variant (large, centered)
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" aria-label="Suscripción al newsletter">
      <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }}
        placeholder="Correo Electrónico"
        className="flex-1 px-5 py-3.5 rounded-full bg-white text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--on-primary-container)]/50 border-0"
        disabled={status === "loading"}
      />
      <Button
        type="submit"
        size="lg"
        disabled={status === "loading"}
        className="rounded-full px-8 bg-[var(--on-primary-container)] text-[var(--on-primary)] hover:bg-[var(--on-primary-fixed)] transition-colors"
      >
        {status === "loading" ? "ENVIANDO..." : "SUSCRIBIRME"}
      </Button>
      {status !== "idle" && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm text-center sm:text-left font-medium ${status === "success" ? "text-green-200" : "text-red-200"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
