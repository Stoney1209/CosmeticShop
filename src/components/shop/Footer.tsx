import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5" aria-label="Luminous - Inicio">
              <span className="text-[var(--primary)] text-2xl font-heading select-none" aria-hidden="true">✦</span>
              <span className="text-xl font-heading text-[var(--on-surface)] tracking-tight">Luminous</span>
            </Link>
            <p className="text-sm text-[var(--on-surface-variant)]/80 mb-6 max-w-xs leading-relaxed">
              Los mejores productos de belleza, maquillaje y cuidado personal directamente en la puerta de tu casa.
            </p>
            <div className="flex gap-5">
              <a href="#" className="text-[var(--on-surface-variant)]/70 hover:text-[var(--primary)] transition-colors text-sm font-medium">Instagram</a>
              <a href="#" className="text-[var(--on-surface-variant)]/70 hover:text-[var(--primary)] transition-colors text-sm font-medium">Facebook</a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading text-[var(--on-surface)] mb-5 text-sm uppercase tracking-wider">Catálogo</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/tienda?category=maquillaje" className="hover:text-[var(--primary)] transition-colors">Maquillaje</Link></li>
              <li><Link href="/tienda?category=skincare" className="hover:text-[var(--primary)] transition-colors">Skincare</Link></li>
              <li><Link href="/tienda?category=perfumes" className="hover:text-[var(--primary)] transition-colors">Perfumería</Link></li>
              <li><Link href="/tienda?category=cabello" className="hover:text-[var(--primary)] transition-colors">Cabello</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading text-[var(--on-surface)] mb-5 text-sm uppercase tracking-wider">Atención</h3>
            <ul className="space-y-3 text-sm">
              <li><span className="text-[var(--on-surface-variant)]/40 cursor-default">Contacto</span></li>
              <li><span className="text-[var(--on-surface-variant)]/40 cursor-default">Política de Envíos</span></li>
              <li><span className="text-[var(--on-surface-variant)]/40 cursor-default">Devoluciones</span></li>
              <li><span className="text-[var(--on-surface-variant)]/40 cursor-default">Preguntas Frecuentes</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-[var(--on-surface)] mb-5 text-sm uppercase tracking-wider">Newsletter</h3>
            <p className="text-sm text-[var(--on-surface-variant)]/80 mb-5">Suscríbete para recibir ofertas exclusivas.</p>
            <form className="flex flex-col sm:flex-row gap-2" aria-label="Formulario de suscripción al newsletter">
              <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
              <input 
                id="newsletter-email"
                type="email" 
                placeholder="Tu email" 
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 text-sm text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <button type="button" className="px-5 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--on-primary)] text-sm font-medium transition-colors">
                Unirse
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-[var(--outline-variant)]/20 mt-14 pt-8 text-center text-sm text-[var(--on-surface-variant)]/50">
          &copy; {new Date().getFullYear()} Luminous Cosmetics. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}