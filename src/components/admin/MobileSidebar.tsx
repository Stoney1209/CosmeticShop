"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminNavItems, adminSecondaryNavItems } from "./Sidebar";

/**
 * U1: Mobile sidebar drawer for admin panel.
 * Renders the same navigation as the desktop Sidebar but in a Sheet overlay.
 */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[var(--on-surface-variant)]"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-[280px] p-0 bg-[#2c2827] border-r border-[#3d3836] flex flex-col">
        <SheetHeader className="p-6 border-b border-[#3d3836]">
          <SheetTitle className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--primary-container)] mb-1">Portal Admin</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#a89690]">Suite de Gestión</p>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4 px-4">
          <nav aria-label="Navegación principal del panel">
            <ul className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-[var(--primary)] text-white font-medium shadow-md"
                          : "text-[#a89690] hover:bg-[#3d3836] hover:text-white"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#a89690]"}`} aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="pt-4 mt-4 border-t border-[#3d3836] space-y-1">
              {adminSecondaryNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#3d3836] text-white font-medium"
                        : "text-[#a89690] hover:bg-[#3d3836] hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#a89690]"}`} aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
