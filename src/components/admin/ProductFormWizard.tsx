"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ChevronLeft, ChevronRight, Save, X, Info, DollarSign, Image as ImageIcon, 
  CheckCircle2, AlertCircle, Eye, LayoutDashboard, History, Trash2, 
  ArrowLeft, ArrowRight, Keyboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { productSchema, type ProductFormValues } from "@/lib/schemas/product";
import { CldUploadWidget } from 'next-cloudinary';
import Image from "next/image";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription 
} from "@/components/ui/form";

interface ProductFormWizardProps {
  initialData?: Partial<ProductFormValues>;
  categories: { id: number; name: string }[];
  onSave: (data: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ProductFormWizard({ 
  initialData, 
  categories, 
  onSave, 
  onCancel, 
  isSubmitting 
}: ProductFormWizardProps) {
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState<ProductFormValues[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      sku: "",
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      price: 0,
      costPrice: 0,
      stock: 0,
      minStock: 10,
      weight: 0,
      brand: "",
      isActive: true,
      isFeatured: false,
      mainImage: "",
      ...initialData,
    },
    mode: "onChange",
  });

  const { control, handleSubmit, setValue, watch, formState: { errors } } = form;
  const watchedValues = useWatch({ control });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(onSave)();
      }
      if (e.key === 'Escape') {
        onCancel();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, onSave, onCancel]);

  // Auto-save Draft
  useEffect(() => {
    const interval = setInterval(() => {
      const currentValues = form.getValues();
      localStorage.setItem('product-draft', JSON.stringify(currentValues));
      // toast.info("Borrador guardado automáticamente", { duration: 1000 });
    }, 30000);
    return () => clearInterval(interval);
  }, [form]);

  // History Management (Undo/Redo)
  const addToHistory = useCallback((values: ProductFormValues) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, values].slice(-20); // Keep last 20 actions
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevValues = history[historyIndex - 1];
      form.reset(prevValues);
      setHistoryIndex(historyIndex - 1);
      toast.info("Acción deshecha");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextValues = history[historyIndex + 1];
      form.reset(nextValues);
      setHistoryIndex(historyIndex + 1);
      toast.info("Acción rehecha");
    }
  };

  // Track changes for history
  useEffect(() => {
    const subscription = watch((value) => {
      // In a real app, we'd debounce this
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ["name", "sku", "slug", "categoryId"] 
      : step === 2 
        ? ["price", "stock", "minStock"] 
        : [];
    
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { id: 1, title: "Información Básica", icon: Info },
    { id: 2, title: "Precios y Stock", icon: DollarSign },
    { id: 3, title: "Multimedia", icon: ImageIcon },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
      {/* Form Side */}
      <div className="space-y-8">
        {/* Stepper */}
        <div className="flex items-center justify-between px-4 py-6 bg-[var(--surface-container-low)] rounded-2xl border border-[var(--outline-variant)]/20">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center gap-2 relative z-10 ${isActive ? 'text-[var(--primary)]' : isCompleted ? 'text-emerald-500' : 'text-[var(--outline)]'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-[var(--primary)] text-white shadow-lg ring-4 ring-[var(--primary)]/10' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-[var(--surface-container-high)]'}`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{s.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-colors ${isCompleted ? 'bg-emerald-500' : 'bg-[var(--outline-variant)]/30'}`} />
                )}
              </div>
            );
          })}
        </div>

        <Form {...form}>
          <form className="space-y-8 animate-fade-up">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Nombre del Producto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Sérum de Vitamina C" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20 text-base" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">SKU Único *</FormLabel>
                        <FormControl>
                          <Input placeholder="VTC-SRM-001" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20 font-mono" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">URL Friendly (Slug) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="serum-vitamina-c" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20 pl-4" />
                          </div>
                        </FormControl>
                        <FormDescription className="text-[10px]">Visible en la barra de navegación: shop.com/producto/slug</FormDescription>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Categoría *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40">
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-[var(--outline-variant)]/20">
                            {categories.map(c => (
                              <SelectItem key={c.id} value={c.id.toString()} className="rounded-lg">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. L'Oréal" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Peso Neto (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Descripción Detallada</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe los beneficios, ingredientes y modo de uso..." {...field} className="min-h-[150px] rounded-2xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20 p-4" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Precio de Venta *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)] font-bold">$</span>
                            <Input type="number" step="0.01" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20 pl-8 font-bold text-lg" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Precio de Costo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)] font-bold">$</span>
                            <Input type="number" step="0.01" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20 pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col justify-end">
                    <div className="h-12 px-4 rounded-xl bg-[var(--surface-container-high)] flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Margen Bruto:</span>
                      <span className={`text-sm font-bold ${((watchedValues.price || 0) - (watchedValues.costPrice || 0)) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {watchedValues.price && watchedValues.price > 0 
                          ? (((watchedValues.price - (watchedValues.costPrice || 0)) / watchedValues.price) * 100).toFixed(1) + '%'
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--outline-variant)]/20">
                  <FormField
                    control={control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Stock Disponible *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Alerta de Stock Bajo</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12 rounded-xl bg-white border-[var(--outline-variant)]/40 focus-visible:ring-[var(--primary)]/20" />
                        </FormControl>
                        <FormDescription className="text-[10px]">Se mostrará en rojo en el listado si baja de este valor.</FormDescription>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-8 p-6 bg-[var(--surface-container-low)] rounded-2xl border border-[var(--outline-variant)]/10">
                  <FormField
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input 
                            type="checkbox" 
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-5 h-5 accent-[var(--primary)] cursor-pointer"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-bold text-sm text-[var(--on-surface)] cursor-pointer">Producto Activo</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input 
                            type="checkbox" 
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-5 h-5 accent-amber-500 cursor-pointer"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-bold text-sm text-[var(--on-surface)] cursor-pointer">Destacar en Inicio</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <FormField
                  control={control}
                  name="mainImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Imagen de Portada *</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[var(--outline-variant)]/40 rounded-3xl bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)] hover:border-[var(--primary)]/40 transition-all cursor-pointer group relative overflow-hidden">
                          {field.value ? (
                            <div className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-2xl border border-white/50">
                              <Image src={field.value} alt="Portada" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button type="button" variant="secondary" size="sm" className="rounded-full">Cambiar Imagen</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-4 text-center">
                              <div className="w-20 h-20 rounded-2xl bg-[var(--primary)]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-10 h-10 text-[var(--primary)]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[var(--on-surface)]">Haz clic para subir imagen</p>
                                <p className="text-[10px] text-[var(--outline)] uppercase tracking-wider mt-1 font-bold">JPG, PNG o WEBP (Máx 2MB)</p>
                              </div>
                            </div>
                          )}
                          <CldUploadWidget 
                            uploadPreset="cosmetics_unsigned" 
                            onSuccess={(result: any) => field.onChange(result.info.secure_url)}
                          >
                            {({ open }) => (
                              <button type="button" className="absolute inset-0 w-full h-full opacity-0" onClick={() => open()} aria-label="Abrir selector de archivos" />
                            )}
                          </CldUploadWidget>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
                  <LayoutDashboard className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Galería de Imágenes</p>
                    <p className="text-xs text-blue-700 mt-1">Próximamente: Podrás añadir hasta 5 imágenes adicionales para mostrar diferentes ángulos del producto.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Actions Bar */}
            <div className="sticky bottom-0 pt-6 pb-2 bg-[var(--surface)] border-t border-[var(--outline-variant)]/10 flex items-center justify-between gap-4 z-20">
              <div className="flex items-center gap-4">
                <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl h-12 px-6 font-bold text-xs uppercase tracking-widest text-[var(--outline)] hover:bg-[var(--error-container)]/10 hover:text-[var(--error)] transition-colors">
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0} className="rounded-xl h-12 w-12" title="Deshacer (Ctrl+Z)">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1} className="rounded-xl h-12 w-12" title="Rehacer (Ctrl+Y)">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-xl h-12 px-8 font-bold text-xs uppercase tracking-widest border-[var(--outline-variant)]">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl h-12 px-10 font-bold text-xs uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 transition-all active:scale-95">
                    Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    onClick={handleSubmit(onSave)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-12 font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    {isSubmitting ? <><History className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4 mr-2" /> Publicar Producto</>}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Preview Side */}
      <div className="hidden lg:block sticky top-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--outline)]">Vista Previa en Vivo</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Actualizado</span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-[var(--outline-variant)]/30 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-primary/5">
            <div className="relative aspect-[4/5] bg-[var(--surface-container-low)]">
              {watchedValues.mainImage ? (
                <Image src={watchedValues.mainImage} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-[var(--outline-variant)]">
                  <ImageIcon className="w-16 h-16" />
                  <p className="text-xs font-medium italic">Sin imagen principal</p>
                </div>
              )}
              {watchedValues.isFeatured && (
                <div className="absolute top-6 left-6">
                  <Badge className="bg-amber-100/90 backdrop-blur-md text-amber-700 font-bold text-[10px] px-3 py-1 border-none shadow-sm">DESTACADO</Badge>
                </div>
              )}
              {!watchedValues.isActive && (
                <div className="absolute top-6 right-6">
                  <Badge variant="secondary" className="bg-slate-800/80 backdrop-blur-md text-white font-bold text-[10px] px-3 py-1 border-none shadow-sm">BORRADOR</Badge>
                </div>
              )}
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">{watchedValues.brand || 'Marca no definida'}</span>
                  <span className="text-[10px] font-mono text-[var(--outline)]">{watchedValues.sku || 'SKU-000'}</span>
                </div>
                <h4 className="text-xl font-heading font-bold text-[var(--on-surface)] leading-tight">{watchedValues.name || 'Título del Producto'}</h4>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-heading font-black text-[var(--on-surface)]">
                  ${(watchedValues.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-[var(--outline)] font-bold uppercase tracking-wider">MXN</span>
              </div>

              <div className="space-y-3 pt-6 border-t border-[var(--outline-variant)]/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--outline)] font-medium">Categoría:</span>
                  <span className="font-bold text-[var(--on-surface)]">
                    {categories.find(c => c.id.toString() === watchedValues.categoryId)?.name || 'Sin categoría'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--outline)] font-medium">Disponibilidad:</span>
                  <span className={`font-bold ${watchedValues.stock && watchedValues.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {watchedValues.stock && watchedValues.stock > 0 ? `${watchedValues.stock} unidades` : 'Agotado'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed line-clamp-3 italic opacity-70">
                {watchedValues.description || 'Aquí aparecerá la descripción breve que verán tus clientes en el catálogo...'}
              </p>

              <Button disabled className="w-full h-14 rounded-2xl bg-[var(--primary)] text-white font-bold text-sm uppercase tracking-widest opacity-40 shadow-none">
                Añadir al Carrito
              </Button>
            </div>
          </div>

          <div className="p-4 bg-[var(--surface-container-low)] rounded-2xl border border-[var(--outline-variant)]/20 flex gap-3">
            <Keyboard className="w-5 h-5 text-[var(--primary)] shrink-0" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-surface)]">Atajos Rápidos</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="text-[9px] font-mono bg-white">Ctrl + S: Guardar</Badge>
                <Badge variant="outline" className="text-[9px] font-mono bg-white">Esc: Cerrar</Badge>
                <Badge variant="outline" className="text-[9px] font-mono bg-white">Ctrl + Z: Deshacer</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
