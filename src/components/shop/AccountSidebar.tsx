"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AccountSidebarProps {
  customer: {
    fullName: string;
    email: string;
  };
  stats: {
    orders: number;
    wishlist: number;
    reviews: number;
  };
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function AccountSidebar({ customer, stats, onLogout, isLoggingOut }: AccountSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/mi-cuenta", label: "Mi Perfil", icon: User },
    { href: "/mis-pedidos", label: "Mis Pedidos", icon: ShoppingBag, badge: stats.orders },
    { href: "/favoritos", label: "Favoritos", icon: Heart, badge: stats.wishlist },
  ];

  // Get initials from full name
  const initials = customer.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900 truncate">{customer.fullName}</h2>
            <p className="text-sm text-slate-500 truncate">{customer.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-6 py-4 transition-colors",
                isActive 
                  ? "bg-pink-50 text-pink-700 border-l-4 border-pink-500" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                index !== navItems.length - 1 && "border-b border-slate-100"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-pink-600" : "text-slate-400")} />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full",
                  isActive ? "bg-pink-100 text-pink-700" : "bg-slate-100 text-slate-600"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full rounded-xl border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
      </Button>
    </div>
  );
}
