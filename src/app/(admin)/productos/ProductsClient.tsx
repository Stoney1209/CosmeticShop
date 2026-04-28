"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
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

export function ProductsClient({ initialProducts, categories }: { initialProducts: any[], categories: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
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
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        toast.success("Producto eliminado");
        setProducts(products.filter((p) => p.id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Error al eliminar");
    }
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
    };

    try {
      if (editingProduct) {
        const result = await updateProduct(editingProduct.id, data);
        if (result.success) {
          toast.success("Actualizado");
          setProducts(products.map(p => p.id === result.product!.id ? { ...result.product, price: Number(result.product!.price) } : p));
          setIsDialogOpen(false);
        } else toast.error(result.error);
      } else {
        const result = await createProduct(data);
        if (result.success) {
          toast.success("Creado");
          setProducts([{ ...result.product, price: Number(result.product!.price) }, ...products]);
          setIsDialogOpen(false);
        } else toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  return (
    <div>
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
        <Input placeholder="Buscar por SKU o Nombre..." className="max-w-xs bg-white" />
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <Button 
                    type="button" 
                    variant={isActive ? "default" : "outline"}
                    className={isActive ? "bg-emerald-500 hover:bg-emerald-600 w-full" : "w-full"}
                    onClick={() => setIsActive(!isActive)}
                  >
                    {isActive ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                    {isActive ? "Producto Activo" : "Producto Inactivo"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio de Venta ($)</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Disponible</Label>
                  <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Imagen Principal</Label>
                <div className="flex items-center gap-4">
                  {mainImage ? (
                    <img src={mainImage} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-slate-200" />
                  ) : (
                    <div className="h-16 w-16 bg-slate-100 rounded-md border border-dashed border-slate-300 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                      <CldUploadWidget 
                        uploadPreset="cosmetics_unsigned" 
                        onSuccess={(result: any) => {
                          setMainImage(result.info.secure_url);
                        }}
                      >
                        {({ open }) => (
                          <Button type="button" variant="outline" onClick={() => open()}>
                            Subir Imagen (Cloudinary)
                          </Button>
                        )}
                      </CldUploadWidget>
                    ) : (
                      <div className="space-y-1">
                        <Input 
                          placeholder="URL de la imagen o configura Cloudinary en .env" 
                          value={mainImage} 
                          onChange={(e) => setMainImage(e.target.value)} 
                        />
                        <p className="text-xs text-amber-600 font-medium">Cloudinary no configurado. Usa URL directa por ahora.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Producto"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="w-[80px]">Img</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                No hay productos registrados.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell>
                  {product.mainImage ? (
                    <img src={product.mainImage} alt={product.name} className="w-10 h-10 rounded-md object-cover border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{product.name}</div>
                  <div className="text-xs text-slate-500 font-mono">SKU: {product.sku}</div>
                </TableCell>
                <TableCell className="text-slate-600">{product.category?.name || "Sin categoría"}</TableCell>
                <TableCell className="text-right font-medium">${product.price.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={product.stock > product.minStock ? "outline" : "destructive"} className={product.stock > product.minStock ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}>
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {product.isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent">Activo</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-blue-600" onClick={() => handleEdit(product)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-red-600" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
