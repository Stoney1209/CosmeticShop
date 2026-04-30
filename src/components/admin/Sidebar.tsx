"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tags, 
  Users, 
  FileText, 
  Settings, 
  PackageOpen, 
  BarChart3,
  Ticket,
  UserCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

// U2: Translated to Spanish. Exported for MobileSidebar reuse.
export const adminNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Productos", href: "/productos", icon: ShoppingBag },
  { name: "Categorías", href: "/categorias", icon: Tags },
  { name: "Inventario", href: "/inventario", icon: PackageOpen },
  { name: "Pedidos", href: "/pedidos", icon: FileText },
  { name: "Clientes", href: "/clientes", icon: UserCircle },
  { name: "Usuarios", href: "/usuarios", icon: Users },
  { name: "Cupones", href: "/cupones", icon: Ticket },
  { name: "Análisis", href: "/reportes", icon: BarChart3 },
];

// U7: Removed dead "Support" href="#" link
export const adminSecondaryNavItems: NavItem[] = [
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    // A4: role="navigation" + aria-label for landmark identification
    <aside
      className="w-64 bg-[#2c2827] text-[#e4e2e1] flex-shrink-0 hidden md:flex flex-col min-h-screen border-r border-[#3d3836]"
      role="navigation"
      aria-label="Navegación principal del panel"
    >
      <div className="p-6 border-b border-[#3d3836]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--primary-container)] mb-1">Portal Admin</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#a89690]">Suite de Gestión</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-[var(--primary)] text-white font-medium shadow-md"
                  : "text-[#a89690] hover:bg-[#3d3836] hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* A5: Inactive text color raised to #a89690 for 4.5:1+ contrast on #2c2827 */}
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#a89690] group-hover:text-[var(--primary-container)]"}`} aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-4 space-y-1">
          {adminSecondaryNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-[#3d3836] text-white font-medium"
                    : "text-[#a89690] hover:bg-[#3d3836] hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#a89690] group-hover:text-[var(--primary-container)]"}`} aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-[#3d3836]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#3d3836]">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Administrador</p>
            <p className="text-[10px] text-[#a89690]">En línea</p>
          </div>
          <div className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
        </div>
      </div>
    </aside>
  );
}
