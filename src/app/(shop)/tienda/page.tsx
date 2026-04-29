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

  let title = "Catálogo | Luminous Cosmetics";
  let description = "Explora nuestra selección de los mejores productos de belleza premium.";

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (category) {
      title = `${category.name} | Catálogo Luminous`;
      description = `Descubre nuestra colección de ${category.name.toLowerCase()}. Productos de alta calidad para tu cuidado personal.`;
    }
  }

  if (search) {
    title = `Resultados: ${search} | Luminous`;
    description = `Resultados de búsqueda para "${search}". Encuentra los mejores productos de cosmética.`;
  }

  if (brand) {
    title = `${brand} | Catálogo Luminous`;
    description = `Productos de la marca ${brand}. Calidad garantizada en Luminous.`;
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

  const products = productsRaw.map((product: any) => ({
    ...product,
    price: Number(product.price),
  }));

  const totalPages = Math.ceil(total / limit);

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" }
  });

  const brands = await prisma.product.groupBy({
    by: ['brand'],
    where: { brand: { not: null } },
    _count: { id: true }
  });

  return (
    <div className="bg-[var(--surface-container-lowest)] min-h-screen py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 lg:mb-16 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading text-[var(--on-surface)] mb-4">
            {categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : "Todo el Catálogo"}
          </h1>
          <p className="text-[var(--on-surface-variant)] text-lg">
            {search ? `Resultados para "${search}"` : "Explora nuestra selección de los mejores productos de belleza."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-6">
            <div className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
              <h3 className="font-heading text-sm text-[var(--on-surface)] mb-5 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categorías
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/tienda" className={`text-sm block py-2 px-3 rounded-lg transition-all ${!categorySlug ? "bg-[var(--primary-container)] text-[var(--on-primary-container)] font-medium" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"}`}>
                    Todas
                  </Link>
                </li>
                {categories.map((category: any) => (
                  <li key={category.id}>
                    <Link href={`/tienda?category=${category.slug}${brand ? `&brand=${brand}` : ""}`} className={`text-sm block py-2 px-3 rounded-lg transition-all ${categorySlug === category.slug ? "bg-[var(--primary-container)] text-[var(--on-primary-container)] font-medium" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {brands.length > 0 && (
              <div className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
                <h3 className="font-heading text-sm text-[var(--on-surface)] mb-5 uppercase tracking-wider">Marcas</h3>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/tienda${categorySlug ? `?category=${categorySlug}` : ""}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!brand ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-sm" : "bg-transparent text-[var(--on-surface-variant)] border-[var(--outline-variant)] hover:border-[var(--primary)]/50"}`}
                  >
                    Todas
                  </Link>
                  {brands.map((brandItem: any) => (
                    <Link 
                      key={brandItem.brand} 
                      href={`/tienda?brand=${encodeURIComponent(brandItem.brand!)}${categorySlug ? `&category=${categorySlug}` : ""}`}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${brand === brandItem.brand ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-sm" : "bg-transparent text-[var(--on-surface-variant)] border-[var(--outline-variant)] hover:border-[var(--primary)]/50"}`}
                    >
                      {brandItem.brand}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
              <h3 className="font-heading text-sm text-[var(--on-surface)] mb-5 uppercase tracking-wider">Precio</h3>
              <form className="flex gap-2 items-center" action="/tienda" method="GET">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {brand && <input type="hidden" name="brand" value={brand} />}
                {inStock && <input type="hidden" name="inStock" value="true" />}
                <Input name="minPrice" type="number" placeholder="Min" className="h-9 text-xs bg-[var(--surface-container-low)]" defaultValue={searchParams.minPrice} />
                <span className="text-[var(--on-surface-variant)]">-</span>
                <Input name="maxPrice" type="number" placeholder="Max" className="h-9 text-xs bg-[var(--surface-container-low)]" defaultValue={searchParams.maxPrice} />
                <Button type="submit" size="icon" className="h-9 w-9 bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary)]/90 shrink-0">
                  <Search className="w-3 h-3" />
                </Button>
              </form>
            </div>

            <div className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
              <h3 className="font-heading text-sm text-[var(--on-surface)] mb-5 uppercase tracking-wider">Disponibilidad</h3>
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
                  className={`text-sm py-2.5 px-4 rounded-lg transition-all ${!inStock ? "bg-[var(--primary)] text-[var(--on-primary)]" : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]"}`}
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
                  className={`text-sm py-2.5 px-4 rounded-lg transition-all ${inStock ? "bg-[var(--primary)] text-[var(--on-primary)]" : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]"}`}
                >
                  En stock
                </Link>
              </div>
            </div>
          </aside>

          <div className="flex-1 w-full">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--surface-container-lowest)] p-4 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
              <span className="text-sm font-medium text-[var(--on-surface-variant)]">
                Mostrando <span className="text-[var(--on-surface)] font-bold">{products.length}</span> de <span className="text-[var(--on-surface)] font-bold">{total}</span> productos
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--on-surface-variant)]/70 font-medium uppercase tracking-wider">Ordenar:</span>
                <Suspense fallback={<div className="text-xs text-[var(--on-surface-variant)]">Cargando...</div>}>
                  <SortSelect currentSort={sort} />
                </Suspense>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product: any) => (
                  <div key={product.id} className="group bg-[var(--surface-container-lowest)] rounded-xl overflow-hidden shadow-[var(--shadow-ambient)] hover:shadow-[var(--shadow-ambient-hover)] transition-all duration-300 flex flex-col">
                    <Link href={`/producto/${product.slug}`} className="aspect-[4/5] bg-[var(--surface-container-low)] relative overflow-hidden flex items-center justify-center">
                      {product.mainImage ? (
                        <img src={product.mainImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="text-[var(--outline-variant)]/40 flex flex-col items-center group-hover:scale-110 transition-transform duration-700">
                          <span className="text-5xl">✦</span>
                        </div>
                      )}
                      {product.stock < product.minStock && product.stock > 0 && (
                        <span className="absolute top-3 left-3 bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] text-[10px] font-bold px-2.5 py-1 rounded-full">Últimas</span>
                      )}
                      {product.stock <= 0 && (
                        <span className="absolute top-3 left-3 bg-[var(--on-surface)] text-[var(--surface)] text-[10px] font-bold px-2.5 py-1 rounded-full">Agotado</span>
                      )}
                    </Link>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-widest">{product.category?.name}</span>
                        {product.brand && <span className="text-[10px] text-[var(--on-surface-variant)]/60 font-medium">{product.brand}</span>}
                      </div>
                      <Link href={`/producto/${product.slug}`} className="block mb-2">
                        <h3 className="font-heading text-base text-[var(--on-surface)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors leading-tight">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-0.5 mb-auto">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 fill-[var(--tertiary-container)] text-[var(--tertiary-container)]" />)}
                      </div>
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--outline-variant)]/20">
                        <span className="text-lg font-semibold text-[var(--on-surface)]">${Number(product.price).toFixed(2)}</span>
                        <Button size="sm" className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--on-primary)] rounded-full font-medium" asChild>
                          <Link href={`/producto/${product.slug}`}>Ver</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-[var(--surface-container-low)] rounded-xl border border-dashed border-[var(--outline-variant)]/50">
                  <span className="text-6xl mb-4 text-[var(--outline-variant)]/40">🔍</span>
                  <p className="text-[var(--on-surface-variant)] font-heading text-xl">Sin resultados</p>
                  <p className="text-sm text-[var(--on-surface-variant)]/70 mt-1">Intenta con otros filtros o términos de búsqueda.</p>
                  <Button variant="outline" className="mt-6 rounded-full border-[var(--outline-variant)]" asChild>
                    <Link href="/tienda">Limpiar filtros</Link>
                  </Button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  className="rounded-full border-[var(--outline-variant)]"
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
                    className="w-10 rounded-full"
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
                  className="rounded-full border-[var(--outline-variant)]"
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