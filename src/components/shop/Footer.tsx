import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5" aria-label="LUXE BEAUTÉ - Inicio">
              <span className="text-[var(--primary)] text-2xl font-heading select-none" aria-hidden="true">✦</span>
              <span className="text-xl font-heading text-[var(--on-surface)] tracking-tight">LUXE BEAUTÉ</span>
            </Link>
            <p className="text-sm text-[var(--on-surface-variant)]/80 mb-6 max-w-xs leading-relaxed">
              Esenciales de belleza premium seleccionados para la clientela más exigente. Radiancia reimaginada.
            </p>
            <div className="flex gap-5">
              <a href="#" className="text-[var(--on-surface-variant)]/70 hover:text-[var(--primary)] transition-colors text-sm font-medium" aria-label="Instagram de LUXE BEAUTÉ">Instagram</a>
              <a href="#" className="text-[var(--on-surface-variant)]/70 hover:text-[var(--primary)] transition-colors text-sm font-medium" aria-label="Facebook de LUXE BEAUTÉ">Facebook</a>
            </div>
          </div>
          
          {/* V4: Unified to Spanish */}
          <div>
            <h3 className="label-editorial text-[var(--on-surface)] mb-5">TIENDA</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/tienda" className="hover:text-[var(--primary)] transition-colors">Todos los Productos</Link></li>
              <li><Link href="/tienda?category=maquillaje" className="hover:text-[var(--primary)] transition-colors">Maquillaje</Link></li>
              <li><Link href="/tienda?category=skincare" className="hover:text-[var(--primary)] transition-colors">Cuidado de la Piel</Link></li>
              <li><Link href="/tienda?category=perfumes" className="hover:text-[var(--primary)] transition-colors">Perfumes</Link></li>
              <li><Link href="/tienda?category=cabello" className="hover:text-[var(--primary)] transition-colors">Cuidado Capilar</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="label-editorial text-[var(--on-surface)] mb-5">AYUDA</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/mi-cuenta" className="hover:text-[var(--primary)] transition-colors">Mi Cuenta</Link></li>
              <li><Link href="/mis-pedidos" className="hover:text-[var(--primary)] transition-colors">Mis Pedidos</Link></li>
              <li><span className="text-[var(--on-surface-variant)]/50 cursor-default">Envíos y Devoluciones</span></li>
              <li><span className="text-[var(--on-surface-variant)]/50 cursor-default">Política de Privacidad</span></li>
            </ul>
          </div>

          <div>
            <h3 className="label-editorial text-[var(--on-surface)] mb-5">NEWSLETTER</h3>
            <p className="text-sm text-[var(--on-surface-variant)]/80 mb-5">Suscríbete para ofertas exclusivas.</p>
            {/* U5: Functional newsletter form with feedback */}
            <NewsletterForm variant="footer" />
          </div>
        </div>
        <div className="divider-luminous mt-14 pt-8 text-center text-sm text-[var(--on-surface-variant)]/50">
          &copy; {new Date().getFullYear()} LUXE BEAUTÉ. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}