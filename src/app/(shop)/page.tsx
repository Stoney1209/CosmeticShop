import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Cosmetics Shop | Belleza y Skincare",
  description: "Tu tienda de cosméticos online con los mejores productos.",
};

export default async function HomePage() {
  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-pink-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <span className="inline-block py-1 px-3 rounded-full bg-pink-100 text-pink-600 text-sm font-semibold mb-6">
                Colección de Primavera 🌸
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Descubre tu belleza <span className="text-pink-500">natural</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Los mejores productos de skincare y maquillaje seleccionados por expertos para resaltar lo mejor de ti.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8" asChild>
                  <Link href="/tienda">Comprar Ahora</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 border-pink-200 text-pink-700 hover:bg-pink-50" asChild>
                  <Link href="/tienda?category=skincare">Ver Skincare</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-amber-100 rounded-full blur-3xl opacity-50 transform scale-110 -z-10"></div>
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative bg-white flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-pink-100/50 flex flex-col items-center justify-center text-pink-400">
                   <span className="text-9xl mb-4">✦</span>
                   <p className="text-pink-500 font-medium tracking-widest uppercase text-sm">Glamour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Compra por Categoría</h2>
            <p className="text-slate-500 mt-2">Encuentra exactamente lo que necesitas</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { name: "Maquillaje", url: "/tienda?category=maquillaje", color: "bg-rose-100", border: "border-rose-200" },
              { name: "Skincare", url: "/tienda?category=skincare", color: "bg-emerald-100", border: "border-emerald-200" },
              { name: "Perfumes", url: "/tienda?category=perfumes", color: "bg-purple-100", border: "border-purple-200" },
              { name: "Cabello", url: "/tienda?category=cabello", color: "bg-amber-100", border: "border-amber-200" },
            ].map((cat) => (
              <Link key={cat.name} href={cat.url} className={`group relative rounded-2xl overflow-hidden aspect-square flex items-center justify-center bg-slate-50 border ${cat.border} hover:shadow-lg transition-all`}>
                <div className={`absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity ${cat.color}`}></div>
                <h3 className="relative z-10 text-xl font-bold text-slate-800 group-hover:scale-110 transition-transform">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Novedades</h2>
              <p className="text-slate-500 mt-2">Los últimos productos agregados a nuestra colección</p>
            </div>
            <Link href="/tienda" className="hidden md:flex items-center text-pink-600 font-medium hover:text-pink-700">
              Ver todo <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col">
                  <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {product.mainImage ? (
                      <img src={product.mainImage} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center group-hover:scale-110 transition-transform duration-700">
                        <span className="text-4xl">✦</span>
                      </div>
                    )}
                    {product.stock < product.minStock && product.stock > 0 && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">Pocas Unidades</span>
                    )}
                    {product.stock <= 0 && (
                      <span className="absolute top-3 left-3 bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">Agotado</span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="text-xs text-pink-500 font-medium mb-1 uppercase tracking-wider">{product.category?.name || "Catálogo"}</div>
                    <Link href={`/producto/${product.slug}`} className="block mb-2">
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-2 group-hover:text-pink-600 transition-colors leading-tight">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 mb-auto">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                      <span className="text-xs text-slate-400 ml-1 font-medium">(12)</span>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                      <span className="text-xl font-extrabold text-slate-900">${Number(product.price).toFixed(2)}</span>
                      <Button size="sm" className="bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white rounded-full font-semibold transition-colors" disabled={product.stock <= 0}>
                        {product.stock <= 0 ? "Agotado" : "Agregar"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <span className="text-4xl mb-4 text-slate-200">🛍️</span>
                <p className="text-slate-500 font-medium">Aún no hay productos en la tienda.</p>
                <p className="text-sm text-slate-400">Visita el panel de administración para empezar a vender.</p>
              </div>
            )}
          </div>
          <div className="mt-10 text-center md:hidden">
            <Button variant="outline" size="lg" className="w-full rounded-full border-slate-300 text-slate-700" asChild>
              <Link href="/tienda">Ver todos los productos</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Newsletter Banner */}
      <section className="bg-pink-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">¿Quieres un 15% de descuento?</h2>
          <p className="text-pink-100 mb-8">Suscríbete a nuestro boletín y recibe consejos de belleza y ofertas exclusivas antes que nadie.</p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input type="email" placeholder="Ingresa tu email" className="flex-1 px-4 py-3 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-white" required />
            <Button type="submit" size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">Suscribirme</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
