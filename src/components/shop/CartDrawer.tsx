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
  
  const [isCheckoutForm, setIsCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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
        <Button variant="ghost" size="icon" className="relative text-[var(--on-surface-variant)] hover:text-[var(--primary)] hover:bg-[var(--secondary-container)]/50">
          <ShoppingBag className="h-5 w-5" />
          {cart.items.length > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--primary)] text-[10px] font-bold text-[var(--on-primary)] flex items-center justify-center border-2 border-[var(--surface)]">
              {cart.totalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-[var(--outline-variant)]/20">
          <SheetTitle className="text-xl font-heading flex items-center gap-2.5">
            {isCheckoutForm ? (
              <span className="flex items-center gap-2 cursor-pointer text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors" onClick={() => setIsCheckoutForm(false)}>
                <ArrowRight className="w-4 h-4 rotate-180" /> Volver
              </span>
            ) : (
              <><ShoppingBag className="w-5 h-5" /> Tu Carrito</>
            )}
          </SheetTitle>
        </SheetHeader>
        
        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6" style={{ color: 'var(--on-surface-variant)' }}>
            <ShoppingBag className="w-16 h-16 mb-4" />
            <p className="text-lg font-heading text-[var(--on-surface)]">Tu carrito está vacío</p>
            <p className="text-sm">Agrega algunos productos para continuar.</p>
          </div>
        ) : isCheckoutForm ? (
          <form onSubmit={handleWhatsAppCheckout} className="flex-1 flex flex-col px-6">
            <ScrollArea className="flex-1 -mx-6 px-6 py-5">
              <div className="space-y-5">
                <p className="text-sm text-[var(--on-surface-variant)]">Completa tus datos para registrar el pedido. Serás redirigido a WhatsApp.</p>
                <div className="space-y-2.5">
                  <Label htmlFor="checkout-name">Nombre completo *</Label>
                  <Input id="checkout-name" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Ana García" className="bg-[var(--surface-container-low)]" />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="checkout-phone">Teléfono (WhatsApp) *</Label>
                  <Input id="checkout-phone" required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej. 55 1234 5678" className="bg-[var(--surface-container-low)]" />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="checkout-address">Dirección de envío (Opcional)</Label>
                  <Input id="checkout-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ej. Calle Principal 123..." className="bg-[var(--surface-container-low)]" />
                </div>
              </div>
            </ScrollArea>
            <div className="py-6 mt-auto bg-[var(--surface-container-lowest)]">
              <Separator className="mb-5" />
              <div className="flex justify-between font-heading text-lg mb-6">
                <span>Total a pagar</span>
                <div className="text-right">
                  {discountAmount > 0 && <p className="text-xs text-[var(--on-surface-variant)] line-through">${cart.totalPrice().toFixed(2)}</p>}
                  <p className="text-[var(--primary)]">${(cart.totalPrice() - discountAmount).toFixed(2)}</p>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--on-primary)] rounded-full py-5 text-base shadow-md">
                {isSubmitting ? "Registrando..." : "Enviar por WhatsApp"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col px-6">
            <ScrollArea className="flex-1 -mx-6 px-6 py-5">
              <div className="space-y-5">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.variantId || 'base'}`} className="flex gap-4 group">
                    <div className="h-20 w-20 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/20 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[var(--outline-variant)]/40">✦</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-heading text-sm text-[var(--on-surface)] line-clamp-1 pr-3">{item.name}</h4>
                          {item.variantLabel && (
                            <span className="text-[10px] bg-[var(--secondary-container)] text-[var(--on-secondary-container)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">
                              {item.variantLabel}
                            </span>
                          )}
                        </div>
                  <button onClick={() => cart.removeItem(item.id, item.variantId)} className="text-[var(--on-surface-variant)]/40 hover:text-[var(--error)] self-start transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center" aria-label="Eliminar producto del carrito">
                    <X className="w-4 h-4" />
                  </button>
                      </div>
                      <div className="text-sm font-medium text-[var(--on-surface)] mt-auto flex items-center justify-between">
                        <span>${item.price.toFixed(2)}</span>
                        <div className="flex items-center border border-[var(--outline-variant)]/30 rounded-lg bg-[var(--surface-container-lowest)] shadow-sm">
                          <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1, item.variantId)} className="px-2.5 py-1.5 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors disabled:opacity-40" disabled={item.quantity <= 1}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1, item.variantId)} className="px-2.5 py-1.5 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="py-6 mt-auto bg-[var(--surface-container-lowest)] space-y-5">
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase text-[var(--on-surface-variant)]/60 tracking-wider">Cupón de descuento</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Código" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    className="h-10 font-bold uppercase bg-[var(--surface-container-low)]"
                  />
                  {appliedCoupon ? (
                    <Button variant="outline" size="sm" onClick={() => {
                      setAppliedCoupon(null);
                      setDiscountAmount(0);
                      setCouponCode("");
                    }} className="border-[var(--error)]/30 text-[var(--error)] hover:bg-[var(--error)]/5">
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
                        toast.success("Cupón aplicado");
                      } else {
                        toast.error(res.error || "Cupón inválido");
                      }
                    }} className="border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/5">
                      Aplicar
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-[11px] font-bold text-[var(--primary)] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {appliedCoupon.code} aplicado (-${discountAmount.toFixed(2)})
                  </p>
                )}
              </div>

              <Separator />
              <div className="flex justify-between font-heading text-lg">
                <span>Total estimado</span>
                <div className="text-right">
                  {discountAmount > 0 && <p className="text-xs text-[var(--on-surface-variant)] line-through font-normal">${cart.totalPrice().toFixed(2)}</p>}
                  <p className="text-[var(--primary)]">${(cart.totalPrice() - discountAmount).toFixed(2)}</p>
                </div>
              </div>
              <Button onClick={() => setIsCheckoutForm(true)} className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--on-primary)] rounded-full py-5 text-base transition-all shadow-md">
                Proceder al Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}