"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface NavbarLinksProps {
  categories: Category[];
}

export function NavbarLinks({ categories }: NavbarLinksProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort");

  const isTiendaActive = pathname === "/tienda" && !currentCategory && !currentSort;

  return (
    <ul className="flex items-center gap-6 lg:gap-8 py-3.5 text-sm font-medium">
      <li>
        <Link 
          href="/tienda" 
          className={`transition-all duration-200 relative py-1 ${
            isTiendaActive 
              ? "text-[var(--primary)] font-semibold" 
              : "text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
          }`}
        >
          Ver Todo
          {isTiendaActive && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
          )}
        </Link>
      </li>
      
      {categories.map((category) => {
        const isActive = currentCategory === category.slug;
        return (
          <li key={category.id}>
            <Link 
              href={`/tienda?category=${category.slug}`} 
              className={`transition-all duration-200 relative py-1 ${
                isActive 
                  ? "text-[var(--primary)] font-semibold" 
                  : "text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
              }`}
            >
              {category.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
              )}
            </Link>
          </li>
        );
      })}

      <li>
        <Link 
          href="/tienda?sort=price_asc" 
          className={`transition-all duration-200 relative py-1 ${
            currentSort === "price_asc" 
              ? "text-[var(--primary)] font-semibold" 
              : "text-[var(--primary)] hover:text-[var(--primary-container)]"
          }`}
        >
          Ofertas
          {currentSort === "price_asc" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
          )}
        </Link>
      </li>
    </ul>
  );
}
