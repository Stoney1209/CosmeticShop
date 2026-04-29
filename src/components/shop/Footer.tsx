import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="Cosmetics Shop - Inicio">
              <span className="text-pink-500 text-2xl font-bold" aria-hidden="true">✦</span>
              <span className="text-xl font-bold text-white tracking-tight">Cosmetics</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              Los mejores productos de belleza, maquillaje y cuidado personal directamente en la puerta de tu casa.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-pink-500 transition-colors font-medium text-sm">Instagram</a>
              <a href="#" className="text-slate-400 hover:text-pink-500 transition-colors font-medium text-sm">Facebook</a>
              <a href="#" className="text-slate-400 hover:text-pink-500 transition-colors font-medium text-sm">Twitter</a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Catálogo</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tienda?category=maquillaje" className="hover:text-pink-400 transition-colors">Maquillaje</Link></li>
              <li><Link href="/tienda?category=skincare" className="hover:text-pink-400 transition-colors">Skincare</Link></li>
              <li><Link href="/tienda?category=perfumes" className="hover:text-pink-400 transition-colors">Perfumería</Link></li>
              <li><Link href="/tienda?category=accesorios" className="hover:text-pink-400 transition-colors">Accesorios</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Atención al Cliente</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-500 cursor-default">Contacto (Próximamente)</span></li>
              <li><span className="text-slate-500 cursor-default">Política de Envíos</span></li>
              <li><span className="text-slate-500 cursor-default">Devoluciones</span></li>
              <li><span className="text-slate-500 cursor-default">Preguntas Frecuentes</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-sm text-slate-400 mb-4">Suscríbete para recibir ofertas exclusivas.</p>
            <form className="flex gap-2" aria-label="Formulario de suscripción al newsletter">
              <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
              <input 
                id="newsletter-email"
                type="email" 
                placeholder="Tu email" 
                className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:border-pink-500 text-white"
              />
              <button type="button" className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Unirse
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Cosmetics Shop. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
