"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SortSelect({ currentSort }: { currentSort: string }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/tienda?${params.toString()}`);
  };

  if (!mounted) {
    return (
      <div className="h-8 w-36 bg-[var(--surface-container-low)] animate-pulse rounded-lg"></div>
    );
  }

  return (
    <select 
      className="text-sm border-none bg-[var(--surface-container-low)] font-medium text-[var(--on-surface)] rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[var(--primary)]/30 cursor-pointer outline-none"
      defaultValue={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="newest">Más recientes</option>
      <option value="price_asc">Precio: menor a mayor</option>
      <option value="price_desc">Precio: mayor a menor</option>
      <option value="name_asc">Nombre: A-Z</option>
    </select>
  );
}