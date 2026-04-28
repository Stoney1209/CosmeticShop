"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/tienda?${params.toString()}`);
  };

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
