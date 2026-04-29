import Link from "next/link";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "./CartDrawer";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export async function Header() {
  // Fetch WhatsApp number from settings
  const whatsappSetting = await prisma.setting.findUnique({
    where: { settingKey: "whatsapp_number" }
  });
  const customerSession = await getCustomerSession();

  const whatsappNumber = whatsappSetting?.settingValue || "5219212724532";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Link href="/" className="flex items-center gap-2" aria-label="Cosmetics Shop - Inicio">
              <span className="text-pink-500 text-2xl font-bold" aria-hidden="true">✦</span>
              <span className="text-xl font-bold tracking-tight text-slate-900">Cosmetics</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <div className="w-full max-w-lg relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <form action="/tienda" method="GET">
                <Input 
                  name="search"
                  type="search" 
                  placeholder="Buscar maquillaje, skincare..." 
                  aria-label="Buscar productos"
                  className="w-full pl-10 bg-slate-50 border-slate-200 focus-visible:ring-pink-500 rounded-full"
                />
              </form>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href={customerSession ? "/mi-cuenta" : "/cuenta/ingresar"} aria-label={customerSession ? "Mi cuenta" : "Iniciar sesión"}>
              <Button variant="ghost" size="icon" className="hidden md:flex text-slate-600 hover:text-pink-600">
                <User className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            {customerSession && (
              <Link href="/mi-cuenta" className="hidden text-sm font-medium text-slate-600 hover:text-pink-600 md:block">
                Hola, {customerSession.fullName.split(" ")[0]}
              </Link>
            )}
            <CartDrawer whatsappNumber={whatsappNumber} />
          </div>
        </div>
      </div>
      <nav className="hidden md:block border-t border-slate-100 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-8 py-3 text-sm font-medium text-slate-600">
            <li><Link href="/tienda" className="hover:text-pink-600 transition-colors">Novedades</Link></li>
            <li><Link href="/tienda?category=maquillaje" className="hover:text-pink-600 transition-colors">Maquillaje</Link></li>
            <li><Link href="/tienda?category=skincare" className="hover:text-pink-600 transition-colors">Skincare</Link></li>
            <li><Link href="/tienda?category=perfumes" className="hover:text-pink-600 transition-colors">Perfumes</Link></li>
            <li><Link href="/tienda?category=cabello" className="hover:text-pink-600 transition-colors">Cabello</Link></li>
            <li><Link href="/tienda?sort=price_asc" className="text-pink-600 font-semibold hover:text-pink-700 transition-colors">Ofertas</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
