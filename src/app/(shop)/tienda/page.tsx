import { Suspense } from "react";
import Link from "next/link";
import { Star, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/shop/SortSelect";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: {
    category?: string;
    search?: string;
    brand?: string;
  };
}): Promise<Metadata> {
  const categorySlug = searchParams.category;
  const search = searchParams.search;
  const brand = searchParams.brand;

  let title = "Catálogo | Cosmetics Shop";
  let description = "Explora nuestra selección de los mejores productos de belleza. Encuentra cosméticos de alta calidad para tu rutina diaria.";

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (category) {
      title = `${category.name} | Catálogo Cosmetics Shop`;
      description = `Descubre nuestra colección de ${category.name.toLowerCase()}. Productos de alta calidad para tu cuidado personal.`;
    }
  }

  if (search) {
    title = `Resultados: ${search} | Cosmetics Shop`;
    description = `Resultados de búsqueda para "${search}". Encuentra los mejores productos de cosmética.`;
  }

  if (brand) {
    title = `${brand} | Catálogo Cosmetics Shop`;
    description = `Productos de la marca ${brand}. Calidad garantizada en Cosmetics Shop.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function StorePage({
  searchParams
}: {
  searchParams: { 
    category?: string; 
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
    sort?: string;
    page?: string;
    inStock?: string;
  }
}) {
  const categorySlug = searchParams.category;
  const search = searchParams.search;
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const brand = searchParams.brand;
  const sort = searchParams.sort || "newest";
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const inStock = searchParams.inStock === "true";

  let whereClause: any = { isActive: true };

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }
  
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } }
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) whereClause.price.gte = minPrice;
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
  }

  if (brand) {
    whereClause.brand = brand;
  }

  if (inStock) {
    whereClause.stock = { gt: 0 };
  }

  // Define sorting
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "name_asc") orderBy = { name: "asc" };

  const skip = (page - 1) * limit;

  const [productsRaw, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: orderBy,
      include: { category: true },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  // Serialize products for client components
  const products = productsRaw.map((product: any) => ({
    ...product,
    price: Number(product.price),
  }));

  const totalPages = Math.ceil(total / limit);

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" }
  });

  // Get unique brands for the filter
  const brands = await prisma.product.groupBy({
    by: ['brand'],
    where: { brand: { not: null } },
    _count: { id: true }
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            {categorySlug ? `Categoría: ${categorySlug.toUpperCase()}` : "Todo el Catálogo"}
          </h1>
          <p className="text-slate-500 text-lg">
            {search ? `Resultados para "${search}"` : "Explora nuestra selección de los mejores productos de belleza."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Categories */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categorías
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/tienda" className={`text-sm block py-1 transition-colors ${!categorySlug ? "text-pink-600 font-bold" : "text-slate-600 hover:text-pink-600"}`}>
                    Todas las categorías
                  </Link>
                </li>
                {categories.map((category: any) => (
                  <li key={category.id}>
                    <Link href={`/tienda?category=${category.slug}${brand ? `&brand=${brand}` : ""}`} className={`text-sm block py-1 transition-colors ${categorySlug === category.slug ? "text-pink-600 font-bold" : "text-slate-600 hover:text-pink-600"}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Marcas</h3>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/tienda${categorySlug ? `?category=${categorySlug}` : ""}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!brand ? "bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-100" : "bg-white text-slate-600 border-slate-200 hover:border-pink-300"}`}
                  >
                    Todas
                  </Link>
                  {brands.map((brandItem: any) => (
                    <Link 
                      key={brandItem.brand} 
                      href={`/tienda?brand=${encodeURIComponent(brandItem.brand!)}${categorySlug ? `&category=${categorySlug}` : ""}`}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${brand === brandItem.brand ? "bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-100" : "bg-white text-slate-600 border-slate-200 hover:border-pink-300"}`}
                    >
                      {brandItem.brand}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter (Visual UI) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Rango de Precio</h3>
              <form className="flex gap-2 items-center" action="/tienda" method="GET">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {brand && <input type="hidden" name="brand" value={brand} />}
                {inStock && <input type="hidden" name="inStock" value="true" />}
                <Input name="minPrice" type="number" placeholder="Min" className="h-9 text-xs" defaultValue={searchParams.minPrice} />
                <span className="text-slate-400">-</span>
                <Input name="maxPrice" type="number" placeholder="Max" className="h-9 text-xs" defaultValue={searchParams.maxPrice} />
                <Button type="submit" size="icon" className="h-9 w-9 bg-slate-900 text-white shrink-0">
                  <Search className="w-3 h-3" />
                </Button>
              </form>
            </div>

            {/* Availability Filter */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Disponibilidad</h3>
              <div className="flex flex-col gap-2">
                <Link 
                  href={`/tienda?${new URLSearchParams({
                    ...(categorySlug && { category: categorySlug }),
                    ...(brand && { brand }),
                    ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
                    ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
                    ...(searchParams.search && { search: searchParams.search }),
                    ...(searchParams.sort && { sort: searchParams.sort }),
                  }).toString()}`}
                  className={`text-sm py-2 px-3 rounded-lg transition-all ${!inStock ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Todos
                </Link>
                <Link 
                  href={`/tienda?${new URLSearchParams({
                    ...(categorySlug && { category: categorySlug }),
                    ...(brand && { brand }),
                    ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
                    ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
                    ...(searchParams.search && { search: searchParams.search }),
                    ...(searchParams.sort && { sort: searchParams.sort }),
                    inStock: "true",
                  }).toString()}`}
                  className={`text-sm py-2 px-3 rounded-lg transition-all ${inStock ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  En stock
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 w-full">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-sm font-medium text-slate-500">
                Mostrando <span className="text-slate-900 font-bold">{products.length}</span> de <span className="text-slate-900 font-bold">{total}</span> productos
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Ordenar por:</span>
                <Suspense fallback={<div className="text-xs text-slate-400">Cargando...</div>}>
                  <SortSelect currentSort={sort} />
                </Suspense>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product: any) => (
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
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">{product.category?.name}</div>
                        {product.brand && <div className="text-[10px] text-slate-400 font-semibold">{product.brand}</div>}
                      </div>
                      <Link href={`/producto/${product.slug}`} className="block mb-2">
                        <h3 className="font-bold text-slate-900 text-base line-clamp-2 group-hover:text-pink-600 transition-colors leading-tight">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1 mb-auto">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <span className="text-lg font-extrabold text-slate-900">${Number(product.price).toFixed(2)}</span>
                        <Button size="sm" className="bg-slate-900 text-white hover:bg-pink-600 rounded-full font-semibold transition-colors" asChild>
                          <Link href={`/producto/${product.slug}`}>Ver detalles</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                  <span className="text-5xl mb-4 grayscale opacity-50">🔍</span>
                  <p className="text-slate-600 font-bold text-xl">Sin resultados</p>
                  <p className="text-slate-400 text-sm mt-1">Intenta con otros filtros o términos de búsqueda.</p>
                  <Button variant="outline" className="mt-6 rounded-full" asChild>
                    <Link href="/tienda">Limpiar todos los filtros</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  asChild
                >
                  <Link href={`/tienda?${new URLSearchParams({
                    ...(categorySlug && { category: categorySlug }),
                    ...(brand && { brand }),
                    ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
                    ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
                    ...(searchParams.search && { search: searchParams.search }),
                    ...(searchParams.sort && { sort: searchParams.sort }),
                    ...(inStock && { inStock: "true" }),
                    page: (page - 1).toString(),
                  }).toString()}`}>
                    Anterior
                  </Link>
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                    asChild
                  >
                    <Link href={`/tienda?${new URLSearchParams({
                      ...(categorySlug && { category: categorySlug }),
                      ...(brand && { brand }),
                      ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
                      ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
                      ...(searchParams.search && { search: searchParams.search }),
                      ...(searchParams.sort && { sort: searchParams.sort }),
                      ...(inStock && { inStock: "true" }),
                      page: pageNum.toString(),
                    }).toString()}`}>
                      {pageNum}
                    </Link>
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  asChild
                >
                  <Link href={`/tienda?${new URLSearchParams({
                    ...(categorySlug && { category: categorySlug }),
                    ...(brand && { brand }),
                    ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
                    ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
                    ...(searchParams.search && { search: searchParams.search }),
                    ...(searchParams.sort && { sort: searchParams.sort }),
                    ...(inStock && { inStock: "true" }),
                    page: (page + 1).toString(),
                  }).toString()}`}>
                    Siguiente
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
