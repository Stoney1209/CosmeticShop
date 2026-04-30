"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Pencil, Trash2, Image as ImageIcon, CheckCircle2, XCircle, Boxes, Tag, Layers, 
  ChevronLeft, ChevronRight, CheckSquare, Square, Upload, Filter, X, Copy, 
  AlertCircle, ArrowUpDown, Search, RotateCcw 
} from "lucide-react";
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
import { addProductImage } from "@/app/actions/product-images";
import { CldUploadWidget } from 'next-cloudinary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductsClient({ initialProducts, categories, variantTypes }: { 
  initialProducts: any[], 
  categories: any[], 
  variantTypes: any[] 
}) {
  const [products, setProducts] = useState(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [priceUpdateDialogOpen, setPriceUpdateDialogOpen] = useState(false);
  const [priceUpdatePercent, setPriceUpdatePercent] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<any>(null);
  const itemsPerPage = 10;
  
  // Form State
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    categoryId: "",
    price: "",
    costPrice: "",
    stock: "0",
    minStock: "10",
    weight: "",
    brand: "",
    isActive: true,
    isFeatured: false,
    mainImage: "",
  });

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];
    
    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.sku.toLowerCase().includes(lowerSearch) ||
        (p.brand && p.brand.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.categoryId.toString() === categoryFilter);
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => 
        statusFilter === "active" ? p.isActive : !p.isActive
      );
    }
    
    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "low") {
        filtered = filtered.filter(p => p.stock <= (p.minStock || 10));
      } else if (stockFilter === "out") {
        filtered = filtered.filter(p => p.stock === 0);
      } else if (stockFilter === "available") {
        filtered = filtered.filter(p => p.stock > (p.minStock || 10));
      }
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, stockFilter, sortField, sortDirection, products]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockFilter("all");
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      sku: "",
      name: "",
      slug: "",
      description: "",
      longDescription: "",
      categoryId: "",
      price: "",
      costPrice: "",
      stock: "0",
      minStock: "10",
      weight: "",
      brand: "",
      isActive: true,
      isFeatured: false,
      mainImage: "",
    });
  };

  const handleEdit = (prod: any) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      slug: prod.slug,
      description: prod.description || "",
      longDescription: prod.longDescription || "",
      categoryId: prod.categoryId.toString(),
      price: prod.price.toString(),
      costPrice: prod.costPrice?.toString() || "",
      stock: prod.stock.toString(),
      minStock: prod.minStock?.toString() || "10",
      weight: prod.weight?.toString() || "",
      brand: prod.brand || "",
      isActive: prod.isActive,
      isFeatured: prod.isFeatured || false,
      mainImage: prod.mainImage || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(products.filter((product) => product.id !== id));
        toast.success("Producto eliminado");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleClone = async (prod: any) => {
    if (!confirm(`¿Clonar "${prod.name}"?`)) return;
    try {
      const result = await createProduct({
        sku: `${prod.sku}-COPY`,
        name: `${prod.name} (Copia)`,
        slug: `${prod.slug}-copy`,
        description: prod.description,
        longDescription: prod.longDescription,
        categoryId: prod.categoryId,
        price: prod.price,
        costPrice: prod.costPrice,
        stock: prod.stock,
        minStock: prod.minStock,
        brand: prod.brand,
        isActive: false,
        isFeatured: prod.isFeatured,
        mainImage: prod.mainImage,
      });
      if (result.success) {
        toast.success("Producto clonado");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al clonar");
    }
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProducts.length === 0) {
      toast.error("Selecciona productos primero");
      return;
    }
    
    const actionText = action === 'activate' ? 'activar' : action === 'deactivate' ? 'desactivar' : 'eliminar';
    if (!confirm(`¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${selectedProducts.length} productos?`)) return;

    try {
      const response = await fetch(`/api/admin/products/bulk-${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProducts }),
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} productos ${actionText}ados`);
        setSelectedProducts([]);
        window.location.reload();
      } else {
        toast.error(`Error al ${actionText}`);
      }
    } catch {
      toast.error(`Error al ${actionText}`);
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (selectedProducts.length === 0 || !priceUpdatePercent) return;
    
    const percent = Number(priceUpdatePercent);
    if (!confirm(`¿Actualizar precios ${percent > 0 ? '+' : ''}${percent}% para ${selectedProducts.length} productos?`)) return;

    try {
      const response = await fetch("/api/admin/products/bulk-price-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProducts, percent }),
      });

      if (response.ok) {
        toast.success("Precios actualizados");
        setSelectedProducts([]);
        setPriceUpdateDialogOpen(false);
        setPriceUpdatePercent("");
        window.location.reload();
      } else {
        toast.error("Error al actualizar precios");
      }
    } catch {
      toast.error("Error al actualizar precios");
    }
  };

  const handleCSVPreview = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const preview = lines.slice(1, 6).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i]?.trim();
        return obj;
      }, {} as any);
    });
    setPreviewData(preview);
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setImportResults(result);
      if (result.success) {
        toast.success(`Importados ${result.imported} productos`);
        window.location.reload();
      } else {
        toast.error(result.error || "Error en la importación");
      }
    } catch {
      toast.error("Error al importar");
    }
  };

  const calculateMargin = (price: number, costPrice?: number) => {
    if (!costPrice || costPrice === 0) return null;
    return ((price - costPrice) / price * 100).toFixed(1);
  };

  const isLowStock = (product: any) => {
    return product.stock <= (product.minStock || 10);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Productos ({filteredProducts.length})</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" /> Importar CSV
            </Button>
            <Button 
              className="bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => { resetForm(); setIsDialogOpen(true); }}
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Buscar por nombre, SKU o marca..." 
              className="pl-10 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={stockFilter} onValueChange={(val) => setStockFilter(val || "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el stock</SelectItem>
              <SelectItem value="low">Stock bajo</SelectItem>
              <SelectItem value="out">Sin stock</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-500">
            <RotateCcw className="w-4 h-4 mr-1" /> Limpiar
          </Button>
        </div>

        {/* Mass Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.length} productos seleccionados
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => setPriceUpdateDialogOpen(true)}>
                Actualizar precios
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Activar
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                <XCircle className="w-4 h-4 mr-1" /> Desactivar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProducts([])}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <button onClick={handleSelectAll} className="hover:bg-slate-100 rounded p-1">
                  {selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </TableHead>
              <TableHead>Imagen</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('sku')}>
                <div className="flex items-center gap-1">SKU <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Producto <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                <div className="flex items-center justify-end gap-1">Precio <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead className="text-right">Costo</TableHead>
              <TableHead className="text-center">Margen</TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort('stock')}>
                <div className="flex items-center justify-center gap-1">Stock <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => {
              const margin = calculateMargin(product.price, product.costPrice);
              const lowStock = isLowStock(product);
              
              return (
                <TableRow key={product.id} className={lowStock ? 'bg-red-50/50' : ''}>
                  <TableCell>
                    <button onClick={() => handleSelectProduct(product.id)} className="hover:bg-slate-100 rounded p-1">
                      {selectedProducts.includes(product.id) ? (
                        <CheckSquare className="w-4 h-4 text-pink-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    {product.mainImage ? (
                      <img src={product.mainImage} className="w-12 h-12 rounded-xl object-cover border" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{product.sku}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{product.name}</div>
                    {product.brand && (
                      <span className="text-xs text-pink-600 font-medium">{product.brand}</span>
                    )}
                    {product.isFeatured && (
                      <Badge className="ml-2 bg-amber-100 text-amber-700 text-[10px]">Destacado</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category?.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">${Number(product.price).toFixed(2)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-slate-600">
                      {product.costPrice ? `$${Number(product.costPrice).toFixed(2)}` : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {margin ? (
                      <span className={`text-sm font-medium ${Number(margin) > 30 ? 'text-emerald-600' : Number(margin) > 15 ? 'text-amber-600' : 'text-red-600'}`}>
                        {margin}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={lowStock ? "destructive" : product.stock === 0 ? "destructive" : "default"}
                      className={!lowStock && product.stock > 0 ? "bg-emerald-100 text-emerald-700" : ""}
                    >
                      {lowStock && <AlertCircle className="w-3 h-3 mr-1" />}
                      {product.stock}
                    </Badge>
                    {product.minStock && (
                      <div className="text-[10px] text-slate-400 mt-1">Mín: {product.minStock}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.isActive ? "default" : "secondary"} className={product.isActive ? "bg-emerald-100 text-emerald-700" : ""}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleClone(product)} className="text-slate-400 hover:text-blue-600">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="text-slate-400 hover:text-blue-600">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? "bg-pink-600" : ""}
              >
                {page}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            
            const data = {
              ...formData,
              longDescription: formData.longDescription,
              categoryId: parseInt(formData.categoryId),
              price: parseFloat(formData.price),
              costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
              stock: parseInt(formData.stock),
              minStock: parseInt(formData.minStock) || 10,
              weight: formData.weight || undefined,
            };

            try {
              const result = editingProduct 
                ? await updateProduct(editingProduct.id, data)
                : await createProduct(data);
                
              if (result.success) {
                toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
                window.location.reload();
              } else {
                toast.error(result.error);
              }
            } catch {
              toast.error('Error inesperado');
            } finally {
              setIsSubmitting(false);
            }
          }}>
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="pricing">Precios e Inventario</TabsTrigger>
                <TabsTrigger value="images">Imágenes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU *</Label>
                    <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Producto *</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL amigable) *</Label>
                    <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría *</Label>
                    <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v || ""})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Descripción Corta</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
                </div>
                
                <div className="space-y-2">
                  <Label>Descripción Larga (HTML)</Label>
                  <Textarea value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} rows={4} />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">Producto Activo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isFeatured" 
                      checked={formData.isFeatured}
                      onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isFeatured" className="cursor-pointer">Producto Destacado</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Precio de Venta *</Label>
                    <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio de Costo</Label>
                    <Input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Margen</Label>
                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md text-sm">
                      {calculateMargin(Number(formData.price), Number(formData.costPrice)) ? 
                        `${calculateMargin(Number(formData.price), Number(formData.costPrice))}%` : 
                        '-'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock Actual *</Label>
                    <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Mínimo (para alertas)</Label>
                    <Input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Imagen Principal</Label>
                  <div className="flex items-center gap-4">
                    {formData.mainImage ? (
                      <img src={formData.mainImage} className="w-20 h-20 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <CldUploadWidget 
                      uploadPreset="cosmetics_unsigned" 
                      onSuccess={(result: any) => setFormData({...formData, mainImage: result.info.secure_url})}
                    >
                      {({ open }) => (
                        <Button type="button" variant="outline" onClick={() => open()}>
                          {formData.mainImage ? 'Cambiar Imagen' : 'Subir Imagen'}
                        </Button>
                      )}
                    </CldUploadWidget>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700">
                {isSubmitting ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Price Update Dialog */}
      <Dialog open={priceUpdateDialogOpen} onOpenChange={setPriceUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Precios Masivamente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Actualizar precios de {selectedProducts.length} productos seleccionados.
            </p>
            <div className="space-y-2">
              <Label>Porcentaje de cambio (+ para aumentar, - para disminuir)</Label>
              <Input 
                type="number" 
                placeholder="Ej: 10 para +10%, -5 para -5%" 
                value={priceUpdatePercent}
                onChange={e => setPriceUpdatePercent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceUpdateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkPriceUpdate} className="bg-pink-600 hover:bg-pink-700">
              Actualizar Precios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Productos desde CSV</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Formato requerido:</h4>
              <code className="text-xs bg-slate-200 px-2 py-1 rounded block">
                sku, name, slug, description, categoryId, price, costPrice, stock, minStock, brand, weight, isFeatured, isActive
              </code>
            </div>
            
            <div className="space-y-2">
              <Label>Archivo CSV</Label>
              <Input 
                type="file" 
                accept=".csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleCSVPreview(file);
                  }
                }}
              />
            </div>
            
            {previewData.length > 0 && (
              <div className="space-y-2">
                <Label>Vista previa (primeras 5 filas):</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(previewData[0]).map(key => (
                          <TableHead key={key} className="text-xs">{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, i) => (
                        <TableRow key={i}>
                          {Object.values(row).map((val: any, j) => (
                            <TableCell key={j} className="text-xs">{val}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {importResults && (
              <div className={`p-4 rounded-lg ${importResults.success ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <p className={importResults.success ? 'text-emerald-700' : 'text-red-700'}>
                  {importResults.success 
                    ? `Importados ${importResults.imported} productos exitosamente` 
                    : importResults.error}
                </p>
                {importResults.errors?.length > 0 && (
                  <ul className="text-xs text-red-600 mt-2">
                    {importResults.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsImportDialogOpen(false);
              setPreviewData([]);
              setImportResults(null);
            }}>
              Cerrar
            </Button>
            <Button 
              onClick={() => {
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (input.files?.[0]) {
                  handleImport(input.files[0]);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={previewData.length === 0}
            >
              <Upload className="w-4 h-4 mr-2" /> Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
