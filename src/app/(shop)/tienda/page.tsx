import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Catálogo | Cosmetics Shop",
};

export default async function StorePage({
  searchParams
}: {
  searchParams: { category?: string; search?: string }
}) {
  const categorySlug = searchParams.category;
  const search = searchParams.search;

  let whereClause: any = { isActive: true };

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }
  
  if (search) {
    whereClause.name = { contains: search, mode: "insensitive" };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            {categorySlug ? `Categoría: ${categorySlug.toUpperCase()}` : "Todo el Catálogo"}
          </h1>
          <p className="text-slate-500 text-lg">
            {search ? `Resultados para "${search}"` : "Explora nuestra selección de los mejores productos de belleza del mundo."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Categorías</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tienda" className={`text-sm ${!categorySlug ? "text-pink-600 font-bold" : "text-slate-600 hover:text-pink-600"}`}>
                  Todas las categorías
                </Link>
              </li>
              {categories.map(c => (
                <li key={c.id}>
                  <Link href={`/tienda?category=${c.slug}`} className={`text-sm ${categorySlug === c.slug ? "text-pink-600 font-bold" : "text-slate-600 hover:text-pink-600"}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-sm font-medium text-slate-500">
                Mostrando <span className="text-slate-900">{products.length}</span> productos
              </span>
              <select className="text-sm border-none bg-transparent font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none">
                <option>Más recientes</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col">
                    <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {product.mainImage ? (
                        <img src={product.mainImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="text-slate-300 flex flex-col items-center group-hover:scale-110 transition-transform duration-700">
                          <span className="text-4xl">✦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="text-xs text-pink-500 font-medium mb-1 uppercase tracking-wider">{product.category?.name}</div>
                      <Link href={`/producto/${product.slug}`} className="block mb-2">
                        <h3 className="font-bold text-slate-900 text-lg line-clamp-2 group-hover:text-pink-600 transition-colors leading-tight">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1 mb-auto">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <span className="text-xl font-extrabold text-slate-900">${Number(product.price).toFixed(2)}</span>
                        <Button size="sm" className="bg-slate-900 text-white hover:bg-pink-600 rounded-full font-semibold transition-colors" asChild>
                          <Link href={`/producto/${product.slug}`}>Ver detalles</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <span className="text-4xl mb-4 text-slate-300">🔍</span>
                  <p className="text-slate-600 font-medium text-lg">No se encontraron productos.</p>
                  <p className="text-slate-500">Intenta navegar por otra categoría.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
