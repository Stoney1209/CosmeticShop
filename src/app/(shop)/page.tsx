import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";

export const metadata = {
  title: "LUXE BEAUTÉ | Premium Beauty & Skincare",
  description: "Discover luxury beauty products curated for the discerning clientele. Radiance reimagined.",
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
    <div className="bg-[#fcf9f8]">
      {/* Hero Section - Editorial Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8f0f0] via-[#f5f0e6] to-[#fcf9f8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <span className="inline-block py-2 px-4 rounded-full chip text-[10px] tracking-[0.2em] mb-6 animate-fade-up">
                THE 9TH STANDARD
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-[68px] font-heading text-[#1b1c1c] leading-[1.1] mb-6 text-balance animate-fade-up animate-stagger-1">
                Radiance <span className="text-[#7a5646] italic">Reimagined</span>
              </h1>
              <p className="text-lg text-[#50443f] mb-10 max-w-md leading-relaxed animate-fade-up animate-stagger-2">
                Discover our curated collection of premium beauty essentials designed to enhance your natural radiance.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up animate-stagger-3">
                <Button size="lg" className="rounded-full px-10 bg-[#7a5646] hover:bg-[#603f30] text-white shadow-md hover:shadow-lg transition-all" asChild>
                  <Link href="/tienda">SHOP NOW</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-10 border-[#7a5646] text-[#7a5646] hover:bg-[#7a5646] hover:text-white transition-all" asChild>
                  <Link href="/tienda?category=skincare">DISCOVER</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,44,44,0.12)] border border-white/50 relative bg-gradient-to-br from-[#f5f0e6] to-[#e8f0f0] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-[#7a5646]/10 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#82746e]/40">
                   <span className="text-[100px] mb-4 select-none" aria-hidden="true">✦</span>
                   <p className="text-[#7a5646] font-heading tracking-[0.3em] uppercase text-sm">LUXE BEAUTÉ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections - Circular */}
      <section className="py-20 lg:py-28 bg-[#fcf9f8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading text-[#1b1c1c]">Curated Collections</h2>
            <p className="text-[#82746e] mt-3">Explore our carefully selected categories</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 justify-items-center">
            {[
              { name: "SKINCARE", slug: "skincare", color: "bg-[#e8f0e8]" },
              { name: "MAKEUP", slug: "maquillaje", color: "bg-[#f5e6e0]" },
              { name: "FRAGRANCE", slug: "perfumes", color: "bg-[#f0e8f5]" },
              { name: "HAIRCARE", slug: "cabello", color: "bg-[#f5f0e6]" },
            ].map((cat, i) => (
              <Link 
                key={cat.name} 
                href={`/tienda?category=${cat.slug}`} 
                className="group flex flex-col items-center"
              >
                <div 
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center ${cat.color} border border-[#d4c3bc]/30 hover:shadow-[0_8px_24px_rgba(44,44,44,0.1)] transition-all duration-300 hover:scale-105`}
                >
                  <span className="text-3xl md:text-4xl" aria-hidden="true">✦</span>
                </div>
                <h3 className="label-editorial text-[#7a5646] mt-4 group-hover:text-[#603f30] transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 lg:py-28 bg-[#f6f3f2]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="label-editorial text-[#7a5646] block mb-2">ICONIC ESSENTIALS</span>
              <h2 className="text-3xl md:text-4xl font-heading text-[#1b1c1c]">Best Sellers</h2>
            </div>
            <Link href="/tienda" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#7a5646] hover:text-[#603f30] transition-colors">
              VIEW ALL <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#fcf9f8] rounded-2xl border border-dashed border-[#d4c3bc]/30">
                <span className="text-5xl mb-4 text-[#82746e]/40">✦</span>
                <p className="text-[#82746e] font-medium text-lg">No products yet.</p>
                <p className="text-sm text-[#82746e]/70 mt-1">Visit the admin panel to start selling.</p>
              </div>
            )}
          </div>
          <div className="mt-12 text-center md:hidden">
            <Button variant="outline" size="lg" className="w-full rounded-full border-[#7a5646] text-[#7a5646]" asChild>
              <Link href="/tienda">VIEW ALL PRODUCTS</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 lg:py-28 bg-[#fcf9f8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,44,44,0.12)] bg-gradient-to-br from-[#b78d7a]/20 to-[#7a5646]/10 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-[80px] text-[#7a5646]/30" aria-hidden="true">✦</span>
                  <p className="text-[#7a5646] font-heading tracking-[0.3em] uppercase text-sm mt-4">OUR PHILOSOPHY</p>
                </div>
              </div>
            </div>
            <div>
              <span className="label-editorial text-[#7a5646] block mb-4">OUR PHILOSOPHY</span>
              <h2 className="text-3xl md:text-4xl font-heading text-[#1b1c1c] mb-6">Purity Without Compromise</h2>
              <p className="text-lg text-[#50443f] mb-8 leading-relaxed">
                "We believe that true beauty comes from ingredients that are as pure as they are powerful. Our formulas are crafted with intention, blending nature's finest elements with scientific innovation."
              </p>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-4xl font-heading text-[#7a5646] mb-2">100%</p>
                  <p className="label-editorial text-[#82746e]">VEGAN FORMULAS</p>
                </div>
                <div>
                  <p className="text-4xl font-heading text-[#7a5646] mb-2">0%</p>
                  <p className="label-editorial text-[#82746e]">SYNTHETIC FILLERS</p>
                </div>
              </div>
              <Link href="#" className="inline-flex items-center gap-2 text-sm font-medium text-[#7a5646] hover:text-[#603f30] transition-colors">
                READ OUR STORY <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-20 lg:py-28 bg-[#b78d7a]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-heading text-[#44281a] mb-4">Join the Atelier</h2>
          <p className="text-[#44281a]/80 mb-10">Subscribe to receive exclusive offers, beauty tips, and early access to new collections.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" aria-label="Newsletter subscription">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input 
              id="newsletter-email" 
              type="email" 
              placeholder="Email Address" 
              className="flex-1 px-5 py-3.5 rounded-full bg-white text-[#1b1c1c] focus:outline-none focus:ring-2 focus:ring-[#44281a]/50 border-0" 
              required 
            />
            <Button type="submit" size="lg" className="rounded-full px-8 bg-[#44281a] text-white hover:bg-[#2e1508] transition-colors">SUBSCRIBE</Button>
          </form>
        </div>
      </section>
    </div>
  );
}