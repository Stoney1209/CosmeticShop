"use client";

import { useState } from "react";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export function AddToCartButton({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      image: product.mainImage,
      slug: product.slug
    });
    toast.success(`${quantity}x ${product.name} agregado al carrito`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="font-medium text-slate-700">Cantidad:</span>
        <div className="flex items-center border border-slate-200 rounded-md">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
            className="px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold w-10 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} 
            className="px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            disabled={quantity >= product.stock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-sm text-slate-500">{product.stock} disponibles</span>
      </div>

      <div className="flex gap-4">
        <Button 
          size="lg" 
          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-full py-6 text-lg shadow-lg shadow-pink-200"
          onClick={handleAdd}
          disabled={product.stock <= 0}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          {product.stock <= 0 ? "Agotado" : "Agregar al carrito"}
        </Button>
      </div>
    </div>
  );
}
