import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/shop/SortSelect";
import { ProductCard } from "@/components/shop/ProductCard";
import { Metadata } from "next";
import { buildTiendaUrl, type TiendaSearchParams, type CategoryNode, type BrandGroup } from "@/types/shop";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    brand?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug = params.category;
  const search = params.search;
  const brand = params.brand;

  let title = "Catálogo | LUXE BEAUTÉ";
  let description = "Explora nuestra selección de los mejores productos de belleza premium.";

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (category) {
      title = `${category.name} | LUXE BEAUTÉ`;
      description = `Descubre nuestra colección de ${category.name.toLowerCase()}. Productos de alta calidad para tu cuidado personal.`;
    }
  }

  if (search) {
    title = `Resultados: ${search} | LUXE BEAUTÉ`;
    description = `Resultados de búsqueda para "${search}". Encuentra los mejores productos de cosmética.`;
  }

  if (brand) {
    title = `${brand} | LUXE BEAUTÉ`;
    description = `Productos de la marca ${brand}. Calidad garantizada en LUXE BEAUTÉ.`;
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
  searchParams: Promise<TiendaSearchParams>;
}) {
  const params = await searchParams;
  const categorySlug = params.category;
  const search = params.search;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const brand = params.brand;
  const sort = params.sort || "newest";
  const page = parseInt(params.page || "1");
  const limit = 12;
  const inStock = params.inStock === "true";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "name_asc") orderBy = { name: "asc" };

  const skip = (page - 1) * limit;

  // P4: All 4 queries in a single Promise.all for maximum parallelism
  const [productsRaw, total, categoriesRaw, brandsRaw] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: orderBy,
      include: { category: true },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: whereClause }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" }
        }
      }
    }),
    prisma.product.groupBy({
      by: ['brand'],
      where: { brand: { not: null } },
      _count: { id: true }
    }),
  ]);

  const products = productsRaw.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    stock: product.stock,
    minStock: product.minStock,
    mainImage: product.mainImage,
    brand: product.brand,
    category: product.category ? { name: product.category.name } : null,
  }));

  const totalPages = Math.ceil(total / limit);

  const categories: CategoryNode[] = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    children: c.children?.map((ch) => ({
      id: ch.id,
      name: ch.name,
      slug: ch.slug,
      parentId: ch.parentId,
      displayOrder: ch.displayOrder,
      isActive: ch.isActive,
    })),
  }));

  const brands: BrandGroup[] = brandsRaw.map((b) => ({
    brand: b.brand,
    _count: b._count,
  }));

  // U9: Resolve category name from slug for breadcrumb
  const currentCategoryName = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name
      || categories.flatMap((c) => c.children || []).find((c) => c.slug === categorySlug)?.name
      || categorySlug
    : null;

  // U7/P5: Helper to build URLs from current params
  const currentParams: TiendaSearchParams = params;

  return (
    <div className="bg-[var(--surface)] min-h-screen py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          {/* U9: Breadcrumb with resolved category name */}
          <nav className="flex items-center gap-2 text-sm text-[var(--outline)] mb-4" aria-label="Ruta de navegación">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">Inicio</Link>
            <span className="text-[var(--outline-variant)]" aria-hidden="true">/</span>
            <Link href="/tienda" className="hover:text-[var(--primary)] transition-colors">Catálogo</Link>
            {currentCategoryName && (
              <>
                <span className="text-[var(--outline-variant)]" aria-hidden="true">/</span>
                <span className="text-[var(--on-surface)] font-medium">{currentCategoryName}</span>
              </>
            )}
          </nav>
          <div className="mb-12 lg:mb-16 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-heading text-[var(--on-surface)] mb-4">
              {currentCategoryName || "Nuestro Catálogo"}
            </h1>
            <p className="text-[var(--outline)] text-lg">
              {search ? `Resultados para "${search}"` : "Explora nuestra selección curada de productos de belleza premium."}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-6" aria-label="Filtros de producto">
            <div className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
              <h3 className="label-editorial text-[var(--on-surface)] mb-5 flex items-center gap-2">
                <Filter className="w-4 h-4" aria-hidden="true" /> CATEGORÍA
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/tienda" className={`text-sm block py-2 px-3 rounded-lg transition-all ${!categorySlug ? "bg-[var(--primary-container)] text-[var(--on-primary-container)] font-medium" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"}`}>
                    Todos
                  </Link>
                </li>
                {categories.filter((cat) => !cat.parentId).map((category) => (
                  <li key={category.id}>
                    <Link href={buildTiendaUrl(currentParams, { category: category.slug, page: undefined })} className={`text-sm block py-2 px-3 rounded-lg transition-all ${categorySlug === category.slug ? "bg-[var(--primary-container)] text-[var(--on-primary-container)] font-medium" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"}`}>
                      {category.name}
                    </Link>
                    {category.children && category.children.length > 0 && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <Link href={buildTiendaUrl(currentParams, { category: child.slug, page: undefined })} className={`text-xs block py-1.5 px-3 rounded-lg transition-all ${categorySlug === child.slug ? "bg-[var(--primary)] text-[var(--on-primary)]" : "text-[var(--outline)] hover:bg-[var(--surface-container-low)]"}`}>
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {brands.length > 0 && (
              <div className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
                <h3 className="label-editorial text-[var(--on-surface)] mb-5">MARCA</h3>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={buildTiendaUrl(currentParams, { brand: undefined, page: undefined })}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!brand ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-sm" : "bg-transparent text-[var(--on-surface-variant)] border-[var(--outline-variant)] hover:border-[var(--primary)]/50"}`}
                  >
                    Todas
                  </Link>
                  {brands.map((brandItem) => (
                    <Link 
                      key={brandItem.brand} 
                      href={buildTiendaUrl(currentParams, { brand: brandItem.brand || undefined, page: undefined })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${brand === brandItem.brand ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-sm" : "bg-transparent text-[var(--on-surface-variant)] border-[var(--outline-variant)] hover:border-[var(--primary)]/50"}`}
                    >
                      {brandItem.brand}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
              <h3 className="label-editorial text-[var(--on-surface)] mb-5">RANGO DE PRECIO</h3>
              <form className="flex gap-2 items-center" action="/tienda" method="GET">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {brand && <input type="hidden" name="brand" value={brand} />}
                {inStock && <input type="hidden" name="inStock" value="true" />}
                <label htmlFor="filter-min-price" className="sr-only">Precio mínimo</label>
                <Input id="filter-min-price" name="minPrice" type="number" placeholder="Mín" className="h-9 text-xs bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" defaultValue={params.minPrice} />
                <span className="text-[var(--on-surface-variant)]" aria-hidden="true">-</span>
                <label htmlFor="filter-max-price" className="sr-only">Precio máximo</label>
                <Input id="filter-max-price" name="maxPrice" type="number" placeholder="Máx" className="h-9 text-xs bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" defaultValue={params.maxPrice} />
                <Button type="submit" size="icon" className="h-9 w-9 bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--on-primary-container)] shrink-0" aria-label="Filtrar por precio">
                  <Search className="w-3 h-3" aria-hidden="true" />
                </Button>
              </form>
            </div>

            <div className="bg-[var(--surface-container-lowest)] p-6 rounded-xl border border-[var(--outline-variant)]/30 shadow-[var(--shadow-ambient)]">
              <h3 className="label-editorial text-[var(--on-surface)] mb-5">DISPONIBILIDAD</h3>
              <div className="flex flex-col gap-2">
                <Link 
                  href={buildTiendaUrl(currentParams, { inStock: undefined, page: undefined })}
                  className={`text-sm py-2.5 px-4 rounded-lg transition-all ${!inStock ? "bg-[var(--primary)] text-[var(--on-primary)]" : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-dim)]"}`}
                >
                  Todos
                </Link>
                <Link 
                  href={buildTiendaUrl(currentParams, { inStock: "true", page: undefined })}
                  className={`text-sm py-2.5 px-4 rounded-lg transition-all ${inStock ? "bg-[var(--primary)] text-[var(--on-primary)]" : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-dim)]"}`}
                >
                  En Stock
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
                <span className="text-xs text-[var(--outline)] font-medium uppercase tracking-wider">Ordenar:</span>
                <Suspense fallback={<div className="text-xs text-[var(--outline)]">Cargando...</div>}>
                  <SortSelect currentSort={sort} />
                </Suspense>
              </div>
            </div>

            {/* V2: Reusing ProductCard component instead of inline card JSX */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-[var(--surface-container-lowest)] rounded-xl border border-dashed border-[var(--outline-variant)]/50">
                  <span className="text-6xl mb-4 text-[var(--outline-variant)]/40" aria-hidden="true">🔍</span>
                  <p className="text-[var(--outline)] font-heading text-xl">Sin resultados</p>
                  <p className="text-sm text-[var(--outline)]/70 mt-1">Prueba con otros filtros o términos de búsqueda.</p>
                  <Link href="/tienda" className="mt-6 inline-flex items-center justify-center rounded-lg border border-border bg-transparent hover:bg-surface-container-low hover:text-on-surface border-[var(--primary)] text-primary text-sm font-medium whitespace-nowrap transition-all h-9 gap-1.5 px-4 rounded-full">Limpiar filtros</Link>
                </div>
              )}
            </div>

            {/* U7/P5: Pagination using centralized buildTiendaUrl */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Paginación de productos">
                {page > 1 ? (
                  <Link href={buildTiendaUrl(currentParams, { page: (page - 1).toString() })} className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent hover:bg-surface-container-low hover:text-on-surface text-sm font-medium whitespace-nowrap transition-all h-9 gap-1.5 px-4 rounded-full border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]">
                    Anterior
                  </Link>
                ) : (
                  <button disabled className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent text-sm font-medium whitespace-nowrap transition-all h-9 gap-1.5 px-4 rounded-full border-[var(--outline-variant)] text-[var(--on-surface-variant)] opacity-50 cursor-not-allowed">
                    Anterior
                  </button>
                )}
                
                <span className="text-sm text-[var(--outline)]">Página {page} de {totalPages}</span>

                {page < totalPages ? (
                  <Link href={buildTiendaUrl(currentParams, { page: (page + 1).toString() })} className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent hover:bg-surface-container-low hover:text-on-surface text-sm font-medium whitespace-nowrap transition-all h-9 gap-1.5 px-4 rounded-full border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]">
                    Siguiente
                  </Link>
                ) : (
                  <button disabled className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent text-sm font-medium whitespace-nowrap transition-all h-9 gap-1.5 px-4 rounded-full border-[var(--outline-variant)] text-[var(--on-surface-variant)] opacity-50 cursor-not-allowed">
                    Siguiente
                  </button>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}