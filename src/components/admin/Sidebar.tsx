"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Tags, Users, FileText, Settings, PackageOpen, BarChart3 } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Productos", href: "/productos", icon: ShoppingBag },
  { name: "Categorías", href: "/categorias", icon: Tags },
  { name: "Inventario", href: "/inventario", icon: PackageOpen },
  { name: "Pedidos", href: "/pedidos", icon: FileText },
  { name: "Usuarios", href: "/usuarios", icon: Users },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex-shrink-0 hidden md:flex flex-col min-h-screen border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <span className="text-pink-500 text-2xl">✦</span>
          Cosmetics<span className="text-pink-500">Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-pink-600 text-white font-medium shadow-md shadow-pink-900/20"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-pink-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Sistema</p>
          <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Todos los servicios OK
          </div>
        </div>
      </div>
    </aside>
  );
}
