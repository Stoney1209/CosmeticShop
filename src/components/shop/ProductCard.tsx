"use client";

import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    minStock: number;
    mainImage: string | null;
    category?: {
      name: string;
    } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const cart = useCart();

  const handleAddToCart = () => {
    if (product.stock <= 0) return;

    cart.addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.mainImage || undefined,
      slug: product.slug,
    });

    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col">
      <Link href={`/producto/${product.slug}`} className="aspect-[4/5] bg-slate-100 relative overflow-hidden flex items-center justify-center">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="text-slate-300 flex flex-col items-center group-hover:scale-110 transition-transform duration-700">
            <span className="text-4xl">✦</span>
          </div>
        )}
        {product.stock < product.minStock && product.stock > 0 && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            Pocas Unidades
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute top-3 left-3 bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            Agotado
          </span>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-pink-500 font-medium mb-1 uppercase tracking-wider">
          {product.category?.name || "Catálogo"}
        </div>
        <Link href={`/producto/${product.slug}`} className="block mb-2">
          <h3 className="font-bold text-slate-900 text-lg line-clamp-2 group-hover:text-pink-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-auto">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs text-slate-400 ml-1 font-medium">(12)</span>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <span className="text-xl font-extrabold text-slate-900">
            ${Number(product.price).toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white rounded-full font-semibold transition-colors"
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            {product.stock <= 0 ? "Agotado" : "Agregar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
