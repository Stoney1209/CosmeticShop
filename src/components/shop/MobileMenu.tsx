"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CategoryNode } from "@/types/shop";

interface MobileMenuProps {
  categories: CategoryNode[];
}

export function MobileMenu({ categories }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const parentCategories = categories.filter((c) => !c.parentId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setOpen(false);
      window.location.href = `/tienda?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[var(--on-surface-variant)]"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-[var(--outline-variant)]/20">
          <SheetTitle className="text-lg font-heading flex items-center gap-2.5">
            <span className="text-[var(--primary)] text-xl" aria-hidden="true">✦</span>
            LUXE BEAUTÉ
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 pt-5">
          <form onSubmit={handleSearch} className="relative" role="search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--on-surface-variant)]/50" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30 rounded-full text-sm"
            />
          </form>
        </div>

        <ScrollArea className="flex-1 px-6 py-5">
          <nav aria-label="Menú de navegación móvil">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/tienda"
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-sm font-semibold text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] rounded-lg transition-colors"
                >
                  Ver Todo
                </Link>
              </li>
              {parentCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/tienda?category=${category.slug}`}
                    onClick={() => setOpen(false)}
                    className="block py-3 px-4 text-sm font-medium text-[var(--on-surface-variant)] hover:text-[var(--primary)] hover:bg-[var(--surface-container-low)] rounded-lg transition-colors"
                  >
                    {category.name}
                  </Link>
                  {category.children && category.children.length > 0 && (
                    <ul className="ml-4 border-l border-[var(--outline-variant)]/20 pl-3">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/tienda?category=${child.slug}`}
                            onClick={() => setOpen(false)}
                            className="block py-2 px-3 text-xs text-[var(--on-surface-variant)]/80 hover:text-[var(--primary)] transition-colors"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li className="pt-2 border-t border-[var(--outline-variant)]/20 mt-2">
                <Link
                  href="/tienda?sort=price_asc"
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--secondary-container)]/30 rounded-lg transition-colors"
                >
                  🏷️ Ofertas
                </Link>
              </li>
            </ul>
          </nav>
        </ScrollArea>

        <div className="px-6 py-5 border-t border-[var(--outline-variant)]/20">
          <Link
            href="/cuenta/ingresar"
            onClick={() => setOpen(false)}
            className="block w-full text-center py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
          >
            Mi Cuenta
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Mobile search button for the header icon area (U2) */
export function MobileSearchButton() {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSearch(false);
      window.location.href = `/tienda?search=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-[var(--on-surface-variant)] hover:text-[var(--primary)] hover:bg-[var(--secondary-container)]/50"
        onClick={() => setShowSearch(true)}
        aria-label="Buscar productos"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </Button>

      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-start justify-center pt-20 px-4 md:hidden" onClick={() => setShowSearch(false)}>
          <div
            className="w-full max-w-md bg-[var(--surface)] rounded-2xl shadow-lg p-4 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="relative" role="search">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--on-surface-variant)]/50" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Buscar cosméticos..."
                aria-label="Buscar productos"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 pr-10 bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30 rounded-full text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]/50 hover:text-[var(--on-surface)]"
                aria-label="Cerrar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
