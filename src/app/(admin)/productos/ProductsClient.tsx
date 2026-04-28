"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon, CheckCircle2, XCircle, Boxes, Tag, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/products";
import { CldUploadWidget } from 'next-cloudinary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductsClient({ initialProducts, categories, variantTypes }: { initialProducts: any[], categories: any[], variantTypes: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic Form State
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [mainImage, setMainImage] = useState("");
  const [brand, setBrand] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [selectedVariantTypes, setSelectedVariantTypes] = useState<number[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const resetForm = () => {
    setEditingProduct(null);
    setSku("");
    setName("");
    setSlug("");
    setDescription("");
    setCategoryId("");
    setPrice("");
    setStock("0");
    setMainImage("");
    setBrand("");
    setIsActive(true);
    setHasVariants(false);
    setSelectedVariantTypes([]);
    setVariants([]);
  };

  const handleEdit = (prod: any) => {
    setEditingProduct(prod);
    setSku(prod.sku);
    setName(prod.name);
    setSlug(prod.slug);
    setDescription(prod.description || "");
    setCategoryId(prod.categoryId.toString());
    setPrice(prod.price.toString());
    setStock(prod.stock.toString());
    setMainImage(prod.mainImage || "");
    setBrand(prod.brand || "");
    setIsActive(prod.isActive);
    
    if (prod.variants && prod.variants.length > 0) {
      setHasVariants(true);
      setVariants(prod.variants.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        price: v.price?.toString() || "",
        stock: v.stock.toString(),
        valueIds: v.values.map((val: any) => val.id)
      })));
    } else {
      setHasVariants(false);
      setVariants([]);
    }
    
    setIsDialogOpen(true);
  };

  const generateVariants = () => {
    if (selectedVariantTypes.length === 0) return;

    // Get all values for selected types
    const typesWithValues = variantTypes.filter(t => selectedVariantTypes.includes(t.id));
    
    // Generate combinations
    const combinations: any[][] = [[]];
    typesWithValues.forEach(type => {
      const newCombinations: any[][] = [];
      combinations.forEach(combo => {
        type.values.forEach((value: any) => {
          newCombinations.push([...combo, value]);
        });
      });
      combinations.splice(0, combinations.length, ...newCombinations);
    });

    // Map to variant objects
    const newVariants = combinations.map((combo, index) => ({
      sku: `${sku}-${index + 1}`,
      price: price,
      stock: "0",
      valueIds: combo.map(v => v.id),
      labels: combo.map(v => v.value).join(" / ")
    }));

    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Selecciona una categoría");
      return;
    }

    setIsSubmitting(true);

    const data = {
      sku,
      name,
      slug,
      description,
      categoryId: parseInt(categoryId),
      price: parseFloat(price),
      stock: parseInt(stock),
      mainImage,
      brand,
      isActive,
      variants: hasVariants ? variants.map(v => ({
        sku: v.sku,
        price: v.price ? parseFloat(v.price) : undefined,
        stock: parseInt(v.stock),
        valueIds: v.valueIds
      })) : undefined
    };

    try {
      if (editingProduct) {
        const result = await updateProduct(editingProduct.id, data);
        if (result.success) {
          toast.success("Producto actualizado");
          window.location.reload(); // Revalidación simple
        } else toast.error(result.error);
      } else {
        const result = await createProduct(data);
        if (result.success) {
          toast.success("Producto creado");
          window.location.reload();
        } else toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div className="relative max-w-xs w-full">
          <Input placeholder="Buscar por SKU o Nombre..." className="bg-white pl-10" />
          <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-100">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[850px] max-h-[95vh] overflow-hidden p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {editingProduct ? <Pencil className="w-6 h-6 text-pink-600" /> : <Plus className="w-6 h-6 text-pink-600" />}
                {editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mx-6 mt-4 w-fit bg-slate-100 p-1 rounded-full">
                  <TabsTrigger value="basic" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Información Básica</TabsTrigger>
                  <TabsTrigger value="variants" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Variantes e Inventario</TabsTrigger>
                </TabsList>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <TabsContent value="basic" className="m-0 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">SKU Maestro</Label>
                        <Input value={sku} onChange={(e) => setSku(e.target.value)} required placeholder="Ej: LAB-001" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Marca</Label>
                        <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ej: L'Oréal" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Nombre del Producto</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Labial Hidratante Mate" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">URL Amigable (Slug)</Label>
                        <Input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="labial-hidratante-mate" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Categoría</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Estado</Label>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant={isActive ? "default" : "outline"}
                            className={isActive ? "bg-emerald-500 hover:bg-emerald-600 flex-1" : "flex-1"}
                            onClick={() => setIsActive(true)}
                          >Activo</Button>
                          <Button 
                            type="button" 
                            variant={!isActive ? "destructive" : "outline"}
                            className="flex-1"
                            onClick={() => setIsActive(false)}
                          >Inactivo</Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Precio Base ($)</Label>
                        <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Stock Total</Label>
                        <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} disabled={hasVariants} />
                        {hasVariants && <p className="text-[10px] text-amber-600">Calculado desde las variantes</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Imagen Principal</Label>
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {mainImage ? (
                          <img src={mainImage} className="h-20 w-20 object-cover rounded-lg border shadow-sm" />
                        ) : (
                          <div className="h-20 w-20 bg-white rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                        <CldUploadWidget 
                          uploadPreset="cosmetics_unsigned" 
                          onSuccess={(result: any) => setMainImage(result.info.secure_url)}
                        >
                          {({ open }) => (
                            <Button type="button" variant="outline" onClick={() => open()} className="bg-white">Cambiar Imagen</Button>
                          )}
                        </CldUploadWidget>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Descripción</Label>
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="resize-none" />
                    </div>
                  </TabsContent>

                  <TabsContent value="variants" className="m-0 space-y-6">
                    <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-pink-600" />
                          <Label className="text-lg font-bold">Manejar Variantes</Label>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-pink-200">
                          <input 
                            type="checkbox" 
                            checked={hasVariants} 
                            onChange={(e) => setHasVariants(e.target.checked)}
                            className="w-4 h-4 text-pink-600 rounded"
                          />
                          <span className="text-sm font-semibold text-pink-700">Activar</span>
                        </div>
                      </div>

                      {hasVariants && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">1. Selecciona Atributos (ej: Tono, Color)</Label>
                            <div className="flex flex-wrap gap-2">
                              {variantTypes.map(type => (
                                <Button
                                  key={type.id}
                                  type="button"
                                  variant={selectedVariantTypes.includes(type.id) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    if (selectedVariantTypes.includes(type.id)) {
                                      setSelectedVariantTypes(selectedVariantTypes.filter(id => id !== type.id));
                                    } else {
                                      setSelectedVariantTypes([...selectedVariantTypes, type.id]);
                                    }
                                  }}
                                  className={selectedVariantTypes.includes(type.id) ? "bg-pink-600" : ""}
                                >
                                  {type.name}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <Button type="button" onClick={generateVariants} disabled={selectedVariantTypes.length === 0} className="w-full bg-slate-900">
                            Generar Combinaciones Automáticamente
                          </Button>
                        </div>
                      )}
                    </div>

                    {hasVariants && variants.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><Boxes className="w-4 h-4" /> Inventario por Variante</h4>
                        <div className="border rounded-xl overflow-hidden">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead className="text-xs font-bold uppercase">Variante</TableHead>
                                <TableHead className="text-xs font-bold uppercase">SKU</TableHead>
                                <TableHead className="text-xs font-bold uppercase">Stock</TableHead>
                                <TableHead className="text-xs font-bold uppercase">Precio ($)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {variants.map((v, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium text-slate-700">{v.labels || "Manual"}</TableCell>
                                  <TableCell>
                                    <Input 
                                      value={v.sku} 
                                      onChange={e => {
                                        const newV = [...variants];
                                        newV[i].sku = e.target.value;
                                        setVariants(newV);
                                      }}
                                      className="h-8 text-xs font-mono"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={v.stock} 
                                      onChange={e => {
                                        const newV = [...variants];
                                        newV[i].stock = e.target.value;
                                        setVariants(newV);
                                      }}
                                      className="h-8 w-20 text-xs"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      value={v.price} 
                                      onChange={e => {
                                        const newV = [...variants];
                                        newV[i].price = e.target.value;
                                        setVariants(newV);
                                      }}
                                      placeholder={price}
                                      className="h-8 w-24 text-xs"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="p-6 border-t bg-slate-50/50">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 min-w-[150px]">
                  {isSubmitting ? "Guardando..." : "Guardar Producto"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200">
              <TableHead className="w-[100px] pl-6 font-bold text-slate-800">Vista</TableHead>
              <TableHead className="font-bold text-slate-800">Producto</TableHead>
              <TableHead className="font-bold text-slate-800">Categoría</TableHead>
              <TableHead className="text-right font-bold text-slate-800">Precio</TableHead>
              <TableHead className="text-center font-bold text-slate-800">Stock</TableHead>
              <TableHead className="text-center font-bold text-slate-800">Variantes</TableHead>
              <TableHead className="text-right pr-6 font-bold text-slate-800">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="pl-6">
                  {product.mainImage ? (
                    <img src={product.mainImage} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-900 leading-tight">{product.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-tighter">SKU: {product.sku}</span>
                    {product.brand && <span className="text-[10px] text-pink-600 font-bold uppercase">{product.brand}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-white text-slate-600 border-slate-200">{product.category?.name}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-bold text-slate-900">${Number(product.price).toFixed(2)}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={product.stock > 0 ? "default" : "destructive"} className={product.stock > 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {product.variants?.length > 0 ? (
                    <Badge variant="outline" className="border-pink-200 bg-pink-50 text-pink-700 font-bold">
                      {product.variants.length} opciones
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
