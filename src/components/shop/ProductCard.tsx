"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
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
    <div className="group bg-[var(--surface-container-lowest)] rounded-xl overflow-hidden shadow-[var(--shadow-ambient)] hover:shadow-[var(--shadow-ambient-hover)] transition-all duration-300 flex flex-col">
      <Link href={`/producto/${product.slug}`} className="aspect-[4/5] bg-[var(--surface-container-low)] relative overflow-hidden flex items-center justify-center">
        {product.mainImage ? (
          /* P1: Next.js Image component for optimized loading */
          <Image
            src={product.mainImage}
            alt={`${product.name} — ${product.category?.name || 'cosmético premium'}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="text-[var(--outline-variant)]/40 flex flex-col items-center group-hover:scale-110 transition-transform duration-700" aria-hidden="true">
            <span className="text-5xl">✦</span>
          </div>
        )}
        {product.stock < product.minStock && product.stock > 0 && (
          <span className="absolute top-3 left-3 bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Pocas Unidades
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute top-3 left-3 bg-[var(--on-surface)] text-[var(--surface)] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Agotado
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            className="rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--on-primary)] shadow-md"
            disabled={product.stock <= 0}
            aria-label={product.stock <= 0 ? "Producto agotado" : `Agregar ${product.name} al carrito`}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            {product.stock <= 0 ? "Agotado" : "Agregar"}
          </Button>
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-[11px] text-[var(--primary)] font-semibold uppercase tracking-widest mb-1.5">
          {product.category?.name || "COLECCIÓN"}
        </div>
        <Link href={`/producto/${product.slug}`} className="block mb-2">
          <h3 className="font-heading text-lg text-[var(--on-surface)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        {/* U6: Removed hardcoded fake stars — no ratings shown unless real data exists */}
        <div className="flex-grow" />
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--outline-variant)]/20">
          <span className="text-xl font-semibold text-[var(--on-surface)]">
            ${Number(product.price).toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            variant="ghost"
            className="text-[var(--primary)] hover:bg-[var(--secondary-container)] rounded-full px-4 min-w-[24px] min-h-[24px]"
            disabled={product.stock <= 0}
            aria-label={product.stock <= 0 ? "Producto agotado" : `Agregar ${product.name} al carrito`}
          >
             <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}