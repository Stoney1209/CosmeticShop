import Link from "next/link";
import { Search, Menu, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "./CartDrawer";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export async function Header() {
  const whatsappSetting = await prisma.setting.findUnique({
    where: { settingKey: "whatsapp_number" }
  });
  const customerSession = await getCustomerSession();

  const whatsappNumber = whatsappSetting?.settingValue || "5219212724532";

  // Obtener categorías activas de la base de datos
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 5, // Limitar a 5 categorías principales
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--outline-variant)]/30 bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-[var(--on-surface-variant)]" aria-label="Abrir menú de navegación">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Link href="/" className="flex items-center gap-2.5" aria-label="LUXE BEAUTÉ - Home">
              <span className="text-[var(--primary)] text-2xl font-heading select-none" aria-hidden="true">✦</span>
              <span className="text-lg font-heading tracking-tight text-[var(--on-surface)] hidden sm:block">LUXE BEAUTÉ</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center px-8 max-w-lg">
            <div className="w-full relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--on-surface-variant)]/50" aria-hidden="true" />
              <form action="/tienda" method="GET">
                <Input 
                  name="search"
                  type="search" 
                  placeholder="Buscar cosméticos..." 
                  aria-label="Buscar productos"
                  className="w-full pl-11 bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30 focus-visible:border-[var(--primary)] rounded-full text-sm"
                />
              </form>
            </div>
          </div>

          <div className="flex items-center gap-1 lg:gap-3">
            <Link href={customerSession ? "/mi-cuenta" : "/cuenta/ingresar"} aria-label={customerSession ? "Mi cuenta" : "Iniciar sesión"}>
              <Button variant="ghost" size="icon" className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] hover:bg-[var(--secondary-container)]/50">
                <User className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            {customerSession && (
              <Link href="/mi-cuenta" className="hidden text-sm font-medium text-[var(--on-surface-variant)] hover:text-[var(--primary)] lg:block">
                Hola, {customerSession.fullName.split(" ")[0]}
              </Link>
            )}
            <CartDrawer whatsappNumber={whatsappNumber} />
          </div>
        </div>
      </div>
      <nav className="hidden md:block border-t border-[var(--outline-variant)]/20 bg-[var(--surface-container-lowest)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-6 lg:gap-8 py-3.5 text-sm font-medium text-[var(--on-surface-variant)]">
            <li><Link href="/tienda" className="hover:text-[var(--primary)] transition-colors">Ver Todo</Link></li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link 
                  href={`/tienda?category=${category.slug}`} 
                  className="hover:text-[var(--primary)] transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li><Link href="/tienda?sort=price_asc" className="text-[var(--primary)] font-semibold hover:text-[var(--primary-container)] transition-colors">Ofertas</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}