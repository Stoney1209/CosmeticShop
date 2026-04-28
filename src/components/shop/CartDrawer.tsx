"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, X, Plus, Minus, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/store/cart";
import { createOrder } from "@/app/actions/orders";
import { validateCoupon } from "@/app/actions/validate-coupon";
import { toast } from "sonner";

export function CartDrawer({ whatsappNumber }: { whatsappNumber: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();
  
  // Checkout flow state
  const [isCheckoutForm, setIsCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleWhatsAppCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) return;
    
    setIsSubmitting(true);

    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      totalAmount: cart.totalPrice() - discountAmount,
      discountAmount: discountAmount,
      couponCode: appliedCoupon?.code,
      items: cart.items.map(item => ({
        productId: item.id,
        productVariantId: item.variantId,
        productName: item.name,
        productSku: item.slug, 
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity
      }))
    };

    try {
      const result = await createOrder(orderData);
      
      if (result.success) {
        // Use the number passed from the database
        const phoneNumber = whatsappNumber.replace(/\D/g, ""); 
        let message = `¡Hola! Acabo de registrar el pedido *${result.order?.orderNumber}*:\n\n`;
        
        cart.items.forEach((item) => {
          const variantText = item.variantLabel ? ` (${item.variantLabel})` : "";
          message += `- ${item.quantity}x ${item.name}${variantText} ($${item.price.toFixed(2)})\n`;
        });
        
        message += `\n*Total a pagar: $${(cart.totalPrice() - discountAmount).toFixed(2)}*`;
        if (discountAmount > 0) message += ` _(Ahorraste $${discountAmount.toFixed(2)})_`;
        message += `\n\nMis datos:\nNombre: ${name}\nTeléfono: ${phone}\nDirección: ${address || 'A convenir'}\n\n`;
        message += `Por favor indíquenme los pasos para el pago y envío.`;
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        
        // Clear cart and close
        cart.clearCart();
        setIsCheckoutForm(false);
      } else {
        toast.error("Hubo un error al registrar el pedido");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet onOpenChange={(open) => !open && setIsCheckoutForm(false)}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-pink-600">
          <ShoppingBag className="h-5 w-5" />
          {cart.items.length > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-pink-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
              {cart.totalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-slate-100">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            {isCheckoutForm ? (
              <span className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-900" onClick={() => setIsCheckoutForm(false)}>
                <ArrowRight className="w-4 h-4 rotate-180" /> Volver al carrito
              </span>
            ) : (
              <><ShoppingBag className="w-5 h-5" /> Tu Carrito</>
            )}
          </SheetTitle>
        </SheetHeader>
        
        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
            <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium font-heading">Tu carrito está vacío</p>
            <p className="text-sm">Agrega algunos productos para continuar.</p>
          </div>
        ) : isCheckoutForm ? (
          // Checkout Form
          <form onSubmit={handleWhatsAppCheckout} className="flex-1 flex flex-col px-6">
            <ScrollArea className="flex-1 -mx-6 px-6 py-4">
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Completa tus datos para registrar el pedido. Serás redirigido a WhatsApp para coordinar el pago.</p>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Ana García" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (WhatsApp) *</Label>
                  <Input id="phone" required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej. 55 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección de envío (Opcional)</Label>
                  <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ej. Calle Principal 123..." />
                </div>
              </div>
            </ScrollArea>
            <div className="py-6 mt-auto bg-white">
              <Separator className="mb-4" />
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total a pagar</span>
                <div className="text-right">
                  {discountAmount > 0 && <p className="text-xs text-slate-400 line-through">${cart.totalPrice().toFixed(2)}</p>}
                  <p className="text-green-600">${(cart.totalPrice() - discountAmount).toFixed(2)}</p>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-lg shadow-lg shadow-green-200 transition-all active:scale-95">
                {isSubmitting ? "Registrando..." : "Enviar por WhatsApp"}
              </Button>
            </div>
          </form>
        ) : (
          // Cart Items
          <div className="flex-1 flex flex-col px-6">
            <ScrollArea className="flex-1 -mx-6 px-6 py-4">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.variantId || 'base'}`} className="flex gap-4 group">
                    <div className="h-20 w-20 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300">✦</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1 text-sm pr-4 font-heading">{item.name}</h4>
                          {item.variantLabel && (
                            <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-pink-100">
                              {item.variantLabel}
                            </span>
                          )}
                        </div>
                        <button onClick={() => cart.removeItem(item.id, item.variantId)} className="text-slate-400 hover:text-red-500 self-start transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-auto flex items-center justify-between">
                        <span>${item.price.toFixed(2)}</span>
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-sm">
                          <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1, item.variantId)} className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors" disabled={item.quantity <= 1}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1, item.variantId)} className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="py-6 mt-auto bg-white space-y-4">
              {/* Coupon UI */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Cupón de descuento</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Código" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    className="h-10 font-bold uppercase"
                  />
                  {appliedCoupon ? (
                    <Button variant="outline" size="sm" onClick={() => {
                      setAppliedCoupon(null);
                      setDiscountAmount(0);
                      setCouponCode("");
                    }} className="text-red-500 border-red-200 hover:bg-red-50">
                      Quitar
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={async () => {
                      if (!couponCode) return;
                      const res = await validateCoupon(couponCode, cart.totalPrice());
                      if (res.success && res.coupon) {
                        const c = res.coupon;
                        let disc = 0;
                        if (c.discountType === "PERCENTAGE") {
                          disc = cart.totalPrice() * (c.value / 100);
                          if (c.maxDiscount && disc > c.maxDiscount) disc = c.maxDiscount;
                        } else {
                          disc = c.value;
                        }
                        setAppliedCoupon(c);
                        setDiscountAmount(disc);
                        toast.success("Cupón aplicado correctamente");
                      } else {
                        toast.error(res.error);
                      }
                    }} className="text-pink-600 border-pink-200 hover:bg-pink-50">
                      Aplicar
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {appliedCoupon.code} aplicado (-${discountAmount.toFixed(2)})
                  </p>
                )}
              </div>

              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total estimado</span>
                <div className="text-right">
                  {discountAmount > 0 && <p className="text-xs text-slate-400 line-through font-normal">${cart.totalPrice().toFixed(2)}</p>}
                  <p className="text-pink-600">${(cart.totalPrice() - discountAmount).toFixed(2)}</p>
                </div>
              </div>
              <Button onClick={() => setIsCheckoutForm(true)} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-6 text-lg transition-all active:scale-95 shadow-xl shadow-slate-200">
                Proceder al Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
