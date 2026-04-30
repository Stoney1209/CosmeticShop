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
    orderBy: { displayOrder: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" }
      }
    }
  });

  const brands = await prisma.product.groupBy({
    by: ['brand'],
    where: { brand: { not: null } },
    _count: { id: true }
  });

  return (
    <div className="bg-[#fcf9f8] min-h-screen py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-[#82746e] mb-4">
            <Link href="/" className="hover:text-[#7a5646] transition-colors">Shop</Link>
            <span className="text-[#d4c3bc]">/</span>
            <span className="text-[#1b1c1c] font-medium">Collections</span>
            {categorySlug && (
              <>
                <span className="text-[#d4c3bc]">/</span>
                <span className="text-[#1b1c1c] font-medium capitalize">{categorySlug}</span>
              </>
            )}
          </nav>
          <div className="mb-12 lg:mb-16 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-heading text-[#1b1c1c] mb-4">
              Our Collection
            </h1>
            <p className="text-[#82746e] text-lg">
              {search ? `Results for "${search}"` : "Explore our curated selection of premium beauty products."}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#d4c3bc]/30 shadow-[0_2px_8px_rgba(44,44,44,0.06)]">
              <h3 className="label-editorial text-[#1b1c1c] mb-5 flex items-center gap-2">
                <Filter className="w-4 h-4" /> CATEGORY
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/tienda" className={`text-sm block py-2 px-3 rounded-lg transition-all ${!categorySlug ? "bg-[#b78d7a] text-white font-medium" : "text-[#50443f] hover:bg-[#f6f3f2]"}`}>
                    All
                  </Link>
                </li>
                {categories.filter((cat: any) => !cat.parentId).map((category: any) => (
                  <li key={category.id}>
                    <Link href={`/tienda?category=${category.slug}${brand ? `&brand=${brand}` : ""}`} className={`text-sm block py-2 px-3 rounded-lg transition-all ${categorySlug === category.slug ? "bg-[#b78d7a] text-white font-medium" : "text-[#50443f] hover:bg-[#f6f3f2]"}`}>
                      {category.name}
                    </Link>
                    {category.children && category.children.length > 0 && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {category.children.map((child: any) => (
                          <li key={child.id}>
                            <Link href={`/tienda?category=${child.slug}${brand ? `&brand=${brand}` : ""}`} className={`text-xs block py-1.5 px-3 rounded-lg transition-all ${categorySlug === child.slug ? "bg-[#7a5646] text-white" : "text-[#82746e] hover:bg-[#f6f3f2]"}`}>
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
              <div className="bg-white p-6 rounded-xl border border-[#d4c3bc]/30 shadow-[0_2px_8px_rgba(44,44,44,0.06)]">
                <h3 className="label-editorial text-[#1b1c1c] mb-5">BRAND</h3>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/tienda${categorySlug ? `?category=${categorySlug}` : ""}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!brand ? "bg-[#7a5646] text-white border-[#7a5646] shadow-sm" : "bg-transparent text-[#50443f] border-[#d4c3bc] hover:border-[#7a5646]/50"}`}
                  >
                    All
                  </Link>
                  {brands.map((brandItem: any) => (
                    <Link 
                      key={brandItem.brand} 
                      href={`/tienda?brand=${encodeURIComponent(brandItem.brand!)}${categorySlug ? `&category=${categorySlug}` : ""}`}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${brand === brandItem.brand ? "bg-[#7a5646] text-white border-[#7a5646] shadow-sm" : "bg-transparent text-[#50443f] border-[#d4c3bc] hover:border-[#7a5646]/50"}`}
                    >
                      {brandItem.brand}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-[#d4c3bc]/30 shadow-[0_2px_8px_rgba(44,44,44,0.06)]">
              <h3 className="label-editorial text-[#1b1c1c] mb-5">PRICE RANGE</h3>
              <form className="flex gap-2 items-center" action="/tienda" method="GET">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {brand && <input type="hidden" name="brand" value={brand} />}
                {inStock && <input type="hidden" name="inStock" value="true" />}
                <Input name="minPrice" type="number" placeholder="Min" className="h-9 text-xs bg-[#f6f3f2] border-[#d4c3bc]/30" defaultValue={searchParams.minPrice} />
                <span className="text-[#50443f]">-</span>
                <Input name="maxPrice" type="number" placeholder="Max" className="h-9 text-xs bg-[#f6f3f2] border-[#d4c3bc]/30" defaultValue={searchParams.maxPrice} />
                <Button type="submit" size="icon" className="h-9 w-9 bg-[#7a5646] text-white hover:bg-[#603f30] shrink-0">
                  <Search className="w-3 h-3" />
                </Button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#d4c3bc]/30 shadow-[0_2px_8px_rgba(44,44,44,0.06)]">
              <h3 className="label-editorial text-[#1b1c1c] mb-5">AVAILABILITY</h3>
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
                  className={`text-sm py-2.5 px-4 rounded-lg transition-all ${!inStock ? "bg-[#7a5646] text-white" : "bg-[#eae7e7] text-[#50443f] hover:bg-[#dcd9d9]"}`}
                >
                  All
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
                  className={`text-sm py-2.5 px-4 rounded-lg transition-all ${inStock ? "bg-[#7a5646] text-white" : "bg-[#eae7e7] text-[#50443f] hover:bg-[#dcd9d9]"}`}
                >
                  In Stock
                </Link>
              </div>
            </div>
          </aside>

          <div className="flex-1 w-full">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-[#d4c3bc]/30 shadow-[0_2px_8px_rgba(44,44,44,0.06)]">
              <span className="text-sm font-medium text-[#50443f]">
                Showing <span className="text-[#1b1c1c] font-bold">{products.length}</span> of <span className="text-[#1b1c1c] font-bold">{total}</span> products
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#82746e] font-medium uppercase tracking-wider">Sort:</span>
                <Suspense fallback={<div className="text-xs text-[#82746e]">Loading...</div>}>
                  <SortSelect currentSort={sort} />
                </Suspense>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product: any) => (
                  <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(44,44,44,0.06)] hover:shadow-[0_8px_24px_rgba(44,44,44,0.1)] transition-all duration-300 flex flex-col border border-[#d4c3bc]/30">
                    <Link href={`/producto/${product.slug}`} className="aspect-[4/5] bg-[#f6f3f2] relative overflow-hidden flex items-center justify-center">
                      {product.mainImage ? (
                        <img src={product.mainImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="text-[#d4c3bc]/40 flex flex-col items-center group-hover:scale-110 transition-transform duration-700">
                          <span className="text-5xl">✦</span>
                        </div>
                      )}
                      {product.stock < product.minStock && product.stock > 0 && (
                        <span className="absolute top-3 left-3 bg-[#979693] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Last few</span>
                      )}
                      {product.stock <= 0 && (
                        <span className="absolute top-3 left-3 bg-[#1b1c1c] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Sold out</span>
                      )}
                    </Link>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] text-[#7a5646] font-bold uppercase tracking-widest">{product.category?.name}</span>
                        {product.brand && <span className="text-[10px] text-[#82746e]/60 font-medium">{product.brand}</span>}
                      </div>
                      <Link href={`/producto/${product.slug}`} className="block mb-2">
                        <h3 className="font-heading text-base text-[#1b1c1c] line-clamp-2 group-hover:text-[#7a5646] transition-colors leading-tight">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-0.5 mb-auto">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 fill-[#979693] text-[#979693]" />)}
                      </div>
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#d4c3bc]/20">
                        <span className="text-lg font-semibold text-[#1b1c1c]">${Number(product.price).toFixed(2)}</span>
                        <Button size="sm" className="bg-[#7a5646] hover:bg-[#603f30] text-white rounded-full font-medium" asChild>
                          <Link href={`/producto/${product.slug}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-[#d4c3bc]/50">
                  <span className="text-6xl mb-4 text-[#d4c3bc]/40">🔍</span>
                  <p className="text-[#82746e] font-heading text-xl">No results</p>
                  <p className="text-sm text-[#82746e]/70 mt-1">Try other filters or search terms.</p>
                  <Button variant="outline" className="mt-6 rounded-full border-[#7a5646] text-[#7a5646]" asChild>
                    <Link href="/tienda">Clear filters</Link>
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
                  className="rounded-full border-[#d4c3bc] text-[#50443f] hover:bg-[#f6f3f2]"
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
                    Previous
                  </Link>
                </Button>
                
                <span className="text-sm text-[#82746e]">Page {page} of {totalPages}</span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  className="rounded-full border-[#d4c3bc] text-[#50443f] hover:bg-[#f6f3f2]"
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
                    Next
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