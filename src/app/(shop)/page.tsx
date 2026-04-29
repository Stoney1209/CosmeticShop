import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";

export const metadata = {
  title: "Cosmetics Shop | Belleza y Skincare de Lujo",
  description: "Tu boutique de cosméticos online con los mejores productos de belleza premium.",
};

export default async function HomePage() {
  const featuredProductsRaw = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  const featuredProducts = featuredProductsRaw.map((product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    stock: product.stock,
    minStock: product.minStock,
    mainImage: product.mainImage,
    category: product.category ? { name: product.category.name } : null
  }));

  return (
    <div className="bg-[var(--surface)]">
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[var(--secondary-container)] to-transparent rounded-full blur-3xl opacity-60 -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <span className="inline-block py-1.5 px-4 rounded-full chip text-xs tracking-widest mb-8 animate-fade-up">
                Nueva Colección Primavera
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-[72px] font-heading text-[var(--on-surface)] leading-[1.1] mb-8 text-balance animate-fade-up animate-stagger-1">
                Descubre tu belleza <span className="text-[var(--primary)] italic">natural</span>
              </h1>
              <p className="text-lg text-[var(--on-surface-variant)] mb-10 max-w-md animate-fade-up animate-stagger-2">
                Los mejores productos de skincare y maquillaje seleccionados por expertos para resaltar lo mejor de ti.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up animate-stagger-3">
                <Button size="lg" className="rounded-full px-8 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--on-primary)] shadow-md hover:shadow-lg" asChild>
                  <Link href="/tienda">Comprar Ahora</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]" asChild>
                  <Link href="/tienda?category=skincare">Ver Skincare</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--secondary-container)] via-[var(--primary-container)]/30 to-[var(--surface)] rounded-full blur-3xl opacity-80 transform scale-110 -z-10" />
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-[var(--shadow-ambient)] border border-[var(--surface-container-lowest)] relative bg-[var(--surface-container-low)] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/5 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--outline-variant)]/50">
                   <span className="text-[120px] mb-4 select-none" aria-hidden="true">✦</span>
                   <p className="text-[var(--primary)] font-heading tracking-[0.3em] uppercase text-sm">Luminous</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[var(--surface-container-lowest)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading text-[var(--on-surface)]">Compra por Categoría</h2>
            <p className="text-[var(--on-surface-variant)] mt-3">Encuentra exactamente lo que necesitas</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Maquillaje", slug: "maquillaje", color: "bg-[#f5e6e0]" },
              { name: "Skincare", slug: "skincare", color: "bg-[#e8f0e8]" },
              { name: "Perfumes", slug: "perfumes", color: "bg-[#f0e8f5]" },
              { name: "Cabello", slug: "cabello", color: "bg-[#f5f0e6]" },
            ].map((cat, i) => (
              <Link 
                key={cat.name} 
                href={`/tienda?category=${cat.slug}`} 
                className={`group relative rounded-2xl overflow-hidden aspect-[4/5] flex items-center justify-center ${cat.color} border border-[var(--outline-variant)]/30 hover:shadow-[var(--shadow-ambient-hover)] transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${cat.color}`} />
                <h3 className="relative z-10 text-xl font-heading text-[var(--on-surface)] group-hover:scale-105 transition-transform duration-300">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading text-[var(--on-surface)]">Novedades</h2>
              <p className="text-[var(--on-surface-variant)] mt-2">Los últimos productos agregados a nuestra colección</p>
            </div>
            <Link href="/tienda" className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--on-primary-container)] transition-colors">
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[var(--surface-container-low)] rounded-2xl border border-dashed border-[var(--outline-variant)]">
                <span className="text-5xl mb-4 text-[var(--outline-variant)]/50">✦</span>
                <p className="text-[var(--on-surface-variant)] font-medium text-lg">Aún no hay productos en la tienda.</p>
                <p className="text-sm text-[var(--on-surface-variant)]/70 mt-1">Visita el panel de administración para empezar a vender.</p>
              </div>
            )}
          </div>
          <div className="mt-12 text-center md:hidden">
            <Button variant="outline" size="lg" className="w-full rounded-full border-[var(--outline-variant)] text-[var(--on-surface-variant)]" asChild>
              <Link href="/tienda">Ver todos los productos</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-20 lg:py-28 bg-[var(--primary-container)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-heading text-[var(--on-primary-container)] mb-4">¿Quieres un 15% de descuento?</h2>
          <p className="text-[var(--on-primary-container)]/80 mb-10">Suscríbete a nuestro boletín y recibe consejos de belleza y ofertas exclusivas antes que nadie.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" aria-label="Formulario de suscripción">
            <label htmlFor="hero-email" className="sr-only">Correo electrónico</label>
            <input 
              id="hero-email" 
              type="email" 
              placeholder="Ingresa tu email" 
              className="flex-1 px-5 py-3.5 rounded-full bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 border-0" 
              required 
            />
            <Button type="submit" size="lg" className="rounded-full px-8 bg-[var(--on-primary-container)] text-[var(--primary-container)] hover:bg-[var(--on-primary-container)]/90">Suscribirme</Button>
          </form>
        </div>
      </section>
    </div>
  );
}