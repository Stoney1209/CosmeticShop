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
  Plus,
  HelpCircle,
  User
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventario", icon: PackageOpen },
  { name: "Orders", href: "/pedidos", icon: FileText },
  { name: "Customers", href: "/clientes", icon: UserCircle },
  { name: "Analytics", href: "/reportes", icon: BarChart3 },
];

const secondaryNavItems = [
  { name: "Settings", href: "/configuracion", icon: Settings },
  { name: "Support", href: "#", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#2c2827] text-[#e4e2e1] flex-shrink-0 hidden md:flex flex-col min-h-screen border-r border-[#3d3836]">
      <div className="p-6 border-b border-[#3d3836]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#b78d7a] mb-1">Admin Portal</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#82746e]">Management Suite</p>
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
                  ? "bg-[#7a5646] text-white font-medium shadow-md"
                  : "hover:bg-[#3d3836] hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#82746e] group-hover:text-[#b78d7a]"}`} />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-6 pb-2">
          <Link
            href="/productos"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#7a5646] text-white font-medium shadow-md hover:bg-[#603f30] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        <div className="pt-4 space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-[#3d3836] text-white font-medium"
                    : "hover:bg-[#3d3836] hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#82746e] group-hover:text-[#b78d7a]"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-[#3d3836]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#3d3836]">
          <div className="w-8 h-8 rounded-full bg-[#7a5646] flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin Profile</p>
            <p className="text-[10px] text-[#82746e]">Online</p>
          </div>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
        </div>
      </div>
    </aside>
  );
}
