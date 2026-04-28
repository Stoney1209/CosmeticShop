import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "./AddToCartButton";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true }
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Related products
  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-pink-600">Inicio</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/tienda" className="hover:text-pink-600">Tienda</Link>
        {product.category && (
          <>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href={`/tienda?category=${product.category.slug}`} className="hover:text-pink-600">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Product Area */}
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
            {product.mainImage ? (
              <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl text-slate-300">✦</span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div>
            <div className="text-sm font-bold text-pink-600 uppercase tracking-widest mb-2">
              {product.brand || product.category?.name || "Cosmetics"}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-sm text-slate-500 underline cursor-pointer">12 Reseñas</span>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500 font-mono">SKU: {product.sku}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-6">
              ${Number(product.price).toFixed(2)}
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">
              {product.description || "Un producto increíble que resaltará tu belleza natural. Fórmula exclusiva y de larga duración."}
            </p>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <AddToCartButton product={product} />
          </div>

          {/* Guarantee / Features */}
          <div className="grid grid-cols-2 gap-4 pt-8 text-sm text-slate-600 bg-slate-50 p-6 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span> Producto 100% Original
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span> Envío seguro
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🐰</span> Cruelty Free
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💳</span> Pagos protegidos
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">También te podría gustar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(item => (
              <Link key={item.id} href={`/producto/${item.slug}`} className="group">
                <div className="aspect-[4/5] bg-slate-100 rounded-xl mb-4 overflow-hidden">
                  {item.mainImage ? (
                    <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">✦</div>
                  )}
                </div>
                <h3 className="font-medium text-slate-900 line-clamp-1 group-hover:text-pink-600">{item.name}</h3>
                <p className="font-bold text-slate-900 mt-1">${Number(item.price).toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
