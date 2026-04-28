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

  // Evitamos el mismatch de hidratación no renderizando el select hasta que el cliente esté listo
  if (!mounted) {
    return (
      <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-md"></div>
    );
  }

  return (
    <select 
      className="text-sm border-none bg-transparent font-bold text-slate-900 focus:ring-0 cursor-pointer outline-none"
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
