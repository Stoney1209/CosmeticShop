"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "./MobileSidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // U11: Functional global search — navigates to /productos?search=...
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[var(--outline-variant)]/30 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {/* U1: Mobile sidebar trigger */}
        <MobileSidebar />
        <div className="flex items-center gap-3">
          <span className="text-[var(--primary)] text-xl font-heading" aria-hidden="true">✦</span>
          <div>
            {/* A7: Changed from h1 to span — each page defines its own h1 */}
            <span className="text-base font-heading font-medium text-[var(--on-surface)]">LUXE BEAUTÉ</span>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--outline)]">Panel Administrativo</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* U11: Functional search form */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-[var(--surface-container-low)] px-3 py-2 rounded-lg border border-[var(--outline-variant)]/30 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition-all" role="search">
          <Search className="w-4 h-4 text-[var(--outline)] mr-2" aria-hidden="true" />
          <input 
            type="search" 
            placeholder="Buscar productos..." 
            aria-label="Buscar productos en el panel"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[var(--on-surface)] w-64 placeholder:text-[var(--outline)]"
          />
        </form>

        {/* U12: Bell kept but without fake badge until real notifications exist */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)] rounded-full"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full ml-2 ring-2 ring-transparent hover:ring-[var(--primary)]/10 transition-all"
                aria-label="Menú de usuario"
              >
                {/* P6: Removed external avatar dependency, using pure CSS fallback */}
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[var(--primary)] text-white text-sm font-medium">AD</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-[var(--on-surface)]">Administrador</p>
                <p className="text-xs leading-none text-[var(--outline)]">
                  admin@luxebeaute.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[var(--error)] cursor-pointer font-medium">Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
