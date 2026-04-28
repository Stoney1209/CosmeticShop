"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AddToCartButton({ product, variantOptions }: { product: any, variantOptions: {[key: string]: any[]} }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedValues, setSelectedValues] = useState<{[key: string]: number}>({});
  const [currentVariant, setCurrentVariant] = useState<any | null>(null);
  const addItem = useCart((state) => state.addItem);

  // Initialize selected values with first options if variants exist
  useEffect(() => {
    if (Object.keys(variantOptions).length > 0) {
      const initial: {[key: string]: number} = {};
      Object.keys(variantOptions).forEach(type => {
        initial[type] = variantOptions[type][0].id;
      });
      setSelectedValues(initial);
    }
  }, [variantOptions]);

  // Find the matching variant whenever selections change
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const selectedIdList = Object.values(selectedValues);
      const match = product.variants.find((v: any) => {
        const variantValueIds = v.values.map((val: any) => val.id);
        return variantValueIds.length === selectedIdList.length && 
               selectedIdList.every(id => variantValueIds.includes(id));
      });
      setCurrentVariant(match || null);
    }
  }, [selectedValues, product.variants]);

  const handleAdd = () => {
    // If has variants but none selected (should not happen with default init)
    if (product.variants?.length > 0 && !currentVariant) {
      toast.error("Por favor selecciona una opción");
      return;
    }

    const price = currentVariant?.price ? Number(currentVariant.price) : Number(product.price);
    const variantLabel = currentVariant?.values.map((v: any) => v.value).join(" / ");

    addItem({
      id: product.id,
      variantId: currentVariant?.id,
      name: product.name,
      variantLabel,
      price,
      quantity,
      image: product.mainImage,
      slug: product.slug
    });

    toast.success(`${quantity}x ${product.name}${variantLabel ? ` (${variantLabel})` : ""} agregado`);
  };

  const displayPrice = currentVariant?.price ? Number(currentVariant.price) : Number(product.price);
  const displayStock = currentVariant ? currentVariant.stock : product.stock;
  const isOutOfStock = displayStock <= 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Variant Selectors */}
      {Object.keys(variantOptions).map((typeName) => (
        <div key={typeName} className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-500">
              {typeName}: <span className="text-slate-900 ml-1">
                {variantOptions[typeName].find(v => v.id === selectedValues[typeName])?.value}
              </span>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            {variantOptions[typeName].map((val: any) => {
              const isSelected = selectedValues[typeName] === val.id;
              return (
                <button
                  key={val.id}
                  onClick={() => setSelectedValues({ ...selectedValues, [typeName]: val.id })}
                  className={cn(
                    "relative h-10 min-w-[3rem] px-3 flex items-center justify-center rounded-xl border-2 transition-all duration-200",
                    isSelected 
                      ? "border-pink-600 bg-pink-50 ring-2 ring-pink-100 ring-offset-2" 
                      : "border-slate-200 bg-white hover:border-pink-200"
                  )}
                >
                  {val.hexColor ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full border border-slate-200" 
                        style={{ backgroundColor: val.hexColor }} 
                      />
                      <span className={cn("text-sm font-bold", isSelected ? "text-pink-700" : "text-slate-600")}>
                        {val.value}
                      </span>
                    </div>
                  ) : (
                    <span className={cn("text-sm font-bold", isSelected ? "text-pink-700" : "text-slate-600")}>
                      {val.value}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white rounded-full p-0.5 shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price Update Display (only if variant price differs) */}
      {currentVariant?.price && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Precio de la variante</p>
          <p className="text-2xl font-black text-slate-900">${displayPrice.toFixed(2)}</p>
        </div>
      )}

      {/* Quantity and CTA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))} 
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 bg-white rounded-full shadow-sm hover:shadow transition-all active:scale-90"
              disabled={isOutOfStock}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-black w-12 text-center text-slate-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(Math.min(displayStock, quantity + 1))} 
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 bg-white rounded-full shadow-sm hover:shadow transition-all active:scale-90"
              disabled={isOutOfStock || quantity >= displayStock}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-bold", isOutOfStock ? "text-red-500" : "text-emerald-600")}>
              {isOutOfStock ? "Sin existencias" : `${displayStock} disponibles`}
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-tighter">Inventario actualizado</p>
          </div>
        </div>

        <Button 
          size="lg" 
          className={cn(
            "w-full rounded-full py-8 text-xl font-black shadow-2xl transition-all duration-300 active:scale-[0.98]",
            isOutOfStock 
              ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none" 
              : "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-100"
          )}
          onClick={handleAdd}
          disabled={isOutOfStock}
        >
          <ShoppingBag className="w-6 h-6 mr-3" />
          {isOutOfStock ? "AGOTADO" : "AÑADIR AL CARRITO"}
        </Button>
      </div>
    </div>
  );
}
