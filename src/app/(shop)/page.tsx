import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { NewsletterForm } from "@/components/shop/NewsletterForm";
import type { CategoryNode } from "@/types/shop";

export const metadata = {
  title: "LUXE BEAUTÉ | Belleza y Cuidado Premium",
  description: "Descubre productos de belleza premium seleccionados para una clientela exigente. Radiancia reimaginada.",
};

export default async function HomePage() {
  const [featuredProductsRaw, categoriesRaw] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: true }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" }
        }
      }
    })
  ]);

  const featuredProducts = featuredProductsRaw.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    stock: product.stock,
    minStock: product.minStock,
    mainImage: product.mainImage,
    category: product.category ? { name: product.category.name } : null
  }));

  const categories: CategoryNode[] = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    image: c.image,
    children: c.children?.map((ch) => ({
      id: ch.id,
      name: ch.name,
      slug: ch.slug,
      parentId: ch.parentId,
      displayOrder: ch.displayOrder,
      isActive: ch.isActive,
    })),
  }));

  const parentCategories = categories.filter((c) => !c.parentId);

  // U3: Use first real category for the "Discover" CTA instead of a hardcoded slug
  const firstCategorySlug = parentCategories[0]?.slug || "tienda";
  const discoverHref = firstCategorySlug === "tienda" ? "/tienda" : `/tienda?category=${firstCategorySlug}`;

  return (
    <div className="bg-[var(--surface)]">
      {/* Hero Section - Editorial Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--surface-container-high)] via-[var(--secondary-container)] to-[var(--surface)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <span className="inline-block py-2 px-4 rounded-full chip text-[10px] tracking-[0.2em] mb-6 animate-fade-up">
                THE 9TH STANDARD
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-[68px] font-heading text-[var(--on-surface)] leading-[1.1] mb-6 text-balance animate-fade-up animate-stagger-1">
                Radiancia <span className="text-[var(--primary)] italic">Reimaginada</span>
              </h1>
              <p className="text-lg text-[var(--on-surface-variant)] mb-10 max-w-md leading-relaxed animate-fade-up animate-stagger-2">
                Descubre nuestra colección curada de esenciales de belleza premium diseñados para realzar tu radiancia natural.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up animate-stagger-3">
                <Link href="/tienda" className="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap transition-all hover:bg-primary/90 shadow-sm h-9 gap-1.5 px-4 rounded-full px-10 bg-[var(--primary)] hover:bg-[var(--on-primary-container)] text-[var(--on-primary)] shadow-md hover:shadow-lg transition-all h-11 gap-2 px-6">COMPRAR AHORA</Link>
                {/* U3: Dynamic category link */}
                <Link href={discoverHref} className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent hover:bg-surface-container-low hover:text-on-surface border-[var(--primary)] text-primary text-sm font-medium whitespace-nowrap transition-all h-9 gap-1.5 px-4 rounded-full px-10 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] transition-all h-11 gap-2 px-6">DESCUBRIR</Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,44,44,0.12)] border border-white/50 relative bg-gradient-to-br from-[var(--secondary-container)] to-[var(--surface-container-high)] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/10 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--outline)]/40">
                   <span className="text-[100px] mb-4 select-none" aria-hidden="true">✦</span>
                   <p className="text-[var(--primary)] font-heading tracking-[0.3em] uppercase text-sm">LUXE BEAUTÉ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections - Circular */}
      <section className="py-20 lg:py-28 bg-[var(--surface)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading text-[var(--on-surface)]">Colecciones Curadas</h2>
            <p className="text-[var(--outline)] mt-3">Explora nuestras categorías cuidadosamente seleccionadas</p>
          </div>

          {/* U8: Auto-fit grid that adapts to actual number of categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 justify-items-center">
            {parentCategories.slice(0, 4).map((category, i) => (
              <Link
                key={category.id}
                href={`/tienda?category=${category.slug}`}
                className="group flex flex-col items-center"
              >
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 hover:shadow-[0_8px_24px_rgba(44,44,44,0.1)] transition-all duration-300 hover:scale-105"
                >
                  <span className="text-3xl md:text-4xl" aria-hidden="true">✦</span>
                </div>
                <h3 className="label-editorial text-[var(--primary)] mt-4 group-hover:text-[var(--on-primary-container)] transition-colors">{category.name}</h3>
                {category.children && category.children.length > 0 && (
                  <p className="text-xs text-[var(--outline)] mt-1">{category.children.length} subcategorías</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 lg:py-28 bg-[var(--surface-container-low)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="label-editorial text-[var(--primary)] block mb-2">ESENCIALES ICÓNICOS</span>
              <h2 className="text-3xl md:text-4xl font-heading text-[var(--on-surface)]">Los Más Vendidos</h2>
            </div>
            <Link href="/tienda" className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--on-primary-container)] transition-colors">
              VER TODO <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--outline-variant)]/30">
                <span className="text-5xl mb-4 text-[var(--outline)]/40" aria-hidden="true">✦</span>
                <p className="text-[var(--outline)] font-medium text-lg">Aún no hay productos.</p>
                <p className="text-sm text-[var(--outline)]/70 mt-1">Visita el panel de administración para empezar a vender.</p>
              </div>
            )}
          </div>
          <div className="mt-12 text-center md:hidden">
            <Link href="/tienda" className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent hover:bg-surface-container-low hover:text-on-surface border-[var(--primary)] text-primary text-sm font-medium whitespace-nowrap transition-all h-9 gap-1.5 px-4 rounded-full border-[var(--primary)] text-[var(--primary)] w-full h-11 gap-2 px-6">VER TODOS LOS PRODUCTOS</Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 lg:py-28 bg-[var(--surface)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,44,44,0.12)] bg-gradient-to-br from-[var(--primary-container)]/20 to-[var(--primary)]/10 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-[80px] text-[var(--primary)]/30" aria-hidden="true">✦</span>
                  <p className="text-[var(--primary)] font-heading tracking-[0.3em] uppercase text-sm mt-4">NUESTRA FILOSOFÍA</p>
                </div>
              </div>
            </div>
            <div>
              <span className="label-editorial text-[var(--primary)] block mb-4">NUESTRA FILOSOFÍA</span>
              <h2 className="text-3xl md:text-4xl font-heading text-[var(--on-surface)] mb-6">Pureza Sin Compromiso</h2>
              <p className="text-lg text-[var(--on-surface-variant)] mb-8 leading-relaxed">
                &ldquo;Creemos que la verdadera belleza proviene de ingredientes tan puros como poderosos. Nuestras fórmulas están elaboradas con intención, combinando los mejores elementos de la naturaleza con la innovación científica.&rdquo;
              </p>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-4xl font-heading text-[var(--primary)] mb-2">100%</p>
                  <p className="label-editorial text-[var(--outline)]">FÓRMULAS VEGANAS</p>
                </div>
                <div>
                  <p className="text-4xl font-heading text-[var(--primary)] mb-2">0%</p>
                  <p className="label-editorial text-[var(--outline)]">RELLENOS SINTÉTICOS</p>
                </div>
              </div>
              {/* U4: Removed dead href="#" link — hidden until an "about" page exists */}
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter — U5: Now functional with NewsletterForm client component */}
      <section className="py-20 lg:py-28 bg-[var(--primary-container)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-heading text-[var(--on-primary-container)] mb-4">Únete al Atelier</h2>
          <p className="text-[var(--on-primary-container)]/80 mb-10">Suscríbete para recibir ofertas exclusivas, tips de belleza y acceso anticipado a nuevas colecciones.</p>
          <NewsletterForm variant="hero" />
        </div>
      </section>
    </div>
  );
}