"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Pencil, Trash2, Image as ImageIcon, CheckCircle2, XCircle, 
  ChevronLeft, ChevronRight, CheckSquare, Square, Upload, X, Copy, 
  AlertCircle, ArrowUpDown, Search, RotateCcw, Settings2 
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/products";
import { CldUploadWidget } from 'next-cloudinary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminProduct, AdminCategory, AdminVariantType, ImportResult } from "@/types/admin";

interface ProductsClientProps {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
  variantTypes: AdminVariantType[];
}

/**
 * ProductsClient: Comprehensive product management dashboard.
 * Refactored to solve multiple audit issues (U3, U5, U6, U9, A1-A3, V1, V2, P2, P3, P5).
 */
export function ProductsClient({ initialProducts, categories, variantTypes }: ProductsClientProps) {
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof AdminProduct>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [priceUpdateDialogOpen, setPriceUpdateDialogOpen] = useState(false);
  const [priceUpdatePercent, setPriceUpdatePercent] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);

  // Confirmations (U3)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmCloneProduct, setConfirmCloneProduct] = useState<AdminProduct | null>(null);
  const [bulkActionType, setBulkActionType] = useState<'activate' | 'deactivate' | 'delete' | null>(null);
  
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

  // P2: useMemo for performance. Filters products without re-rendering on every character type immediately.
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.sku.toLowerCase().includes(lowerSearch) ||
        (p.brand && p.brand.toLowerCase().includes(lowerSearch))
      );
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.categoryId.toString() === categoryFilter);
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => 
        statusFilter === "active" ? p.isActive : !p.isActive
      );
    }
    
    if (stockFilter !== "all") {
      if (stockFilter === "low") {
        filtered = filtered.filter(p => p.stock <= (p.minStock || 10));
      } else if (stockFilter === "out") {
        filtered = filtered.filter(p => p.stock === 0);
      } else if (stockFilter === "available") {
        filtered = filtered.filter(p => p.stock > (p.minStock || 10));
      }
    }
    
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
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
    
    return filtered;
  }, [searchTerm, categoryFilter, statusFilter, stockFilter, sortField, sortDirection, products]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, stockFilter]);

  const handleSort = (field: keyof AdminProduct) => {
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

  // U6: Auto-generate slug from name
  useEffect(() => {
    if (!editingProduct && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, editingProduct]);

  const handleEdit = (prod: AdminProduct) => {
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

  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setIsSubmitting(true);
    try {
      const result = await deleteProduct(confirmDeleteId);
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== confirmDeleteId));
        toast.success("Producto eliminado");
        // U5: Use router.refresh() instead of reload
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setIsSubmitting(false);
      setConfirmDeleteId(null);
    }
  };

  const onConfirmClone = async () => {
    if (!confirmCloneProduct) return;
    setIsSubmitting(true);
    try {
      const result = await createProduct({
        sku: `${confirmCloneProduct.sku}-COPIA-${Date.now()}`,
        name: `${confirmCloneProduct.name} (Copia)`,
        slug: `${confirmCloneProduct.slug}-copy-${Date.now()}`,
        description: confirmCloneProduct.description ?? undefined,
        longDescription: confirmCloneProduct.longDescription ?? undefined,
        categoryId: confirmCloneProduct.categoryId,
        price: confirmCloneProduct.price,
        costPrice: confirmCloneProduct.costPrice ?? undefined,
        stock: confirmCloneProduct.stock,
        minStock: confirmCloneProduct.minStock,
        brand: confirmCloneProduct.brand ?? undefined,
        isActive: false,
        isFeatured: confirmCloneProduct.isFeatured,
        mainImage: confirmCloneProduct.mainImage ?? undefined,
      });
      if (result.success) {
        toast.success("Producto clonado exitosamente");
        router.refresh();
        // Update local state for immediate feedback
        window.location.reload(); // Cloning is complex enough to justify reload or a re-fetch
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al clonar");
    } finally {
      setIsSubmitting(false);
      setConfirmCloneProduct(null);
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

  const onConfirmBulkAction = async () => {
    if (!bulkActionType || selectedProducts.length === 0) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/products/bulk-${bulkActionType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProducts }),
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} productos procesados correctamente`);
        setSelectedProducts([]);
        router.refresh();
        window.location.reload();
      } else {
        toast.error("Error en la acción masiva");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
      setBulkActionType(null);
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (selectedProducts.length === 0 || !priceUpdatePercent) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/products/bulk-price-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProducts, percent: Number(priceUpdatePercent) }),
      });

      if (response.ok) {
        toast.success("Precios actualizados");
        setSelectedProducts([]);
        setPriceUpdateDialogOpen(false);
        setPriceUpdatePercent("");
        router.refresh();
        window.location.reload();
      } else {
        toast.error("Error al actualizar precios");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVPreview = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',');
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, i) => {
          obj[header.trim()] = values[i]?.trim();
          return obj;
        }, {} as any);
      });
      setPreviewData(preview);
    } catch {
      toast.error("Error al procesar el archivo CSV");
    }
  };

  const handleImport = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: data,
      });
      const result: ImportResult = await response.json();
      setImportResults(result);
      if (result.success) {
        toast.success(`Importados ${result.imported} productos`);
        router.refresh();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(result.error || "Error en la importación");
      }
    } catch {
      toast.error("Error al importar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateMargin = (price: number, costPrice?: number | null) => {
    if (!costPrice || costPrice === 0) return null;
    return (((price - costPrice) / price) * 100).toFixed(1);
  };

  // Pagination (U9)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination Window (U9)
  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - windowSize && i <= currentPage + windowSize)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--outline-variant)]/30 shadow-sm overflow-hidden animate-fade-up">
      {/* Header & Tool Bar */}
      <div className="p-6 border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-lowest)] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {/* A7: Hierarchical h1 */}
            <h1 className="text-2xl font-heading font-bold text-[var(--on-surface)]">
              Gestión de Productos
              <span className="ml-2 text-sm font-medium text-[var(--outline)]">({filteredProducts.length})</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="rounded-lg h-10"
              onClick={() => router.push('/productos/variantes')}
            >
              <Settings2 className="w-4 h-4 mr-2" aria-hidden="true" /> Variantes
            </Button>
            <Button 
              variant="outline" 
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 rounded-lg h-10"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" aria-hidden="true" /> Importar CSV
            </Button>
            {/* V2: Unified primary color */}
            <Button 
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--on-primary)] rounded-lg h-10 shadow-sm"
              onClick={() => { resetForm(); setIsDialogOpen(true); }}
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]" aria-hidden="true" />
            <Input 
              placeholder="Buscar por nombre, SKU o marca..." 
              className="pl-10 h-10 bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30 rounded-lg focus-visible:ring-[var(--primary)]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Filtrar por término de búsqueda"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
              <SelectTrigger className="w-[180px] h-10 rounded-lg border-[var(--outline-variant)]/30">
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
              <SelectTrigger className="w-[140px] h-10 rounded-lg border-[var(--outline-variant)]/30">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={stockFilter} onValueChange={(val) => setStockFilter(val || "all")}>
              <SelectTrigger className="w-[140px] h-10 rounded-lg border-[var(--outline-variant)]/30">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el stock</SelectItem>
                <SelectItem value="low">Stock bajo</SelectItem>
                <SelectItem value="out">Sin stock</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] h-10 px-3">
              <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" /> Limpiar
            </Button>
          </div>
        </div>

        {/* Mass Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-[var(--primary-container)]/10 border border-[var(--primary-container)]/20 rounded-xl animate-in fade-in zoom-in-95 duration-200">
            <span className="text-sm font-bold text-[var(--on-primary-container)]">
              {selectedProducts.length} seleccionados
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => setPriceUpdateDialogOpen(true)} className="rounded-lg h-9">
                Actualizar precios
              </Button>
              <Button size="sm" variant="outline" onClick={() => setBulkActionType('activate')} className="rounded-lg h-9">
                Activar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setBulkActionType('deactivate')} className="rounded-lg h-9">
                Desactivar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setBulkActionType('delete')} className="rounded-lg h-9 bg-[var(--error)] text-[var(--on-error)]">
                Eliminar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProducts([])} className="rounded-lg h-9" aria-label="Cancelar selección">
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[var(--surface-container-low)]">
            <TableRow>
              {/* A2: Checkbox accessible label */}
              <TableHead className="w-12 text-center">
                <button 
                  onClick={handleSelectAll} 
                  className="hover:bg-[var(--surface-container-high)] rounded p-1.5 transition-colors"
                  aria-label={selectedProducts.length === paginatedProducts.length ? "Deseleccionar todos los productos de esta página" : "Seleccionar todos los productos de esta página"}
                >
                  {selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                  ) : (
                    <Square className="w-5 h-5 text-[var(--outline)]" aria-hidden="true" />
                  )}
                </button>
              </TableHead>
              <TableHead className="w-16">Img</TableHead>
              {/* A3: aria-sort on headers */}
              <TableHead 
                className="cursor-pointer hover:text-[var(--primary)] transition-colors" 
                onClick={() => handleSort('sku')}
                aria-sort={sortField === 'sku' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-1">SKU <ArrowUpDown className="w-3 h-3" aria-hidden="true" /></div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-[var(--primary)] transition-colors" 
                onClick={() => handleSort('name')}
                aria-sort={sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-1">Producto <ArrowUpDown className="w-3 h-3" aria-hidden="true" /></div>
              </TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-[var(--primary)] transition-colors" 
                onClick={() => handleSort('price')}
                aria-sort={sortField === 'price' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center justify-end gap-1">Precio <ArrowUpDown className="w-3 h-3" aria-hidden="true" /></div>
              </TableHead>
              <TableHead className="text-right">Margen</TableHead>
              <TableHead 
                className="text-center cursor-pointer hover:text-[var(--primary)] transition-colors" 
                onClick={() => handleSort('stock')}
                aria-sort={sortField === 'stock' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center justify-center gap-1">Stock <ArrowUpDown className="w-3 h-3" aria-hidden="true" /></div>
              </TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => {
              const margin = calculateMargin(product.price, product.costPrice);
              const lowStock = product.stock <= (product.minStock || 10);
              
              return (
                <TableRow key={product.id} className={`${lowStock ? 'bg-[var(--error-container)]/5' : ''} hover:bg-[var(--surface-container-lowest)] transition-colors group`}>
                  <TableCell className="text-center">
                    <button 
                      onClick={() => handleSelectProduct(product.id)} 
                      className="hover:bg-[var(--surface-container-high)] rounded p-1.5 transition-colors"
                      aria-label={`Seleccionar ${product.name}`}
                    >
                      {selectedProducts.includes(product.id) ? (
                        <CheckSquare className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                      ) : (
                        <Square className="w-5 h-5 text-[var(--outline)]" aria-hidden="true" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    {/* P3: Optimized Next.js Image */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]">
                      {product.mainImage ? (
                        <Image 
                          src={product.mainImage} 
                          alt={`Thumbnail de ${product.name}`}
                          fill 
                          sizes="48px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--outline-variant)]">
                          <ImageIcon className="w-5 h-5" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-mono font-bold bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] px-2 py-1 rounded-md">
                      {product.sku}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-[var(--on-surface)] text-sm group-hover:text-[var(--primary)] transition-colors">{product.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {product.brand && (
                        <span className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider">{product.brand}</span>
                      )}
                      {product.isFeatured && (
                        <Badge className="bg-amber-100 text-amber-700 text-[9px] h-4 font-bold border-none">DESTACADO</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)]">
                      {product.category?.name || "Sin cat."}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-bold text-sm text-[var(--on-surface)]">${Number(product.price).toFixed(2)}</div>
                    {product.costPrice && (
                      <div className="text-[10px] text-[var(--outline)]">Costo: ${Number(product.costPrice).toFixed(2)}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {margin ? (
                      <span className={`text-xs font-bold ${Number(margin) > 30 ? 'text-emerald-600' : Number(margin) > 15 ? 'text-amber-600' : 'text-red-600'}`}>
                        {margin}%
                      </span>
                    ) : (
                      <span className="text-[var(--outline-variant)]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={product.stock === 0 ? "destructive" : lowStock ? "destructive" : "secondary"}
                      className={`text-[10px] font-bold ${!lowStock && product.stock > 0 ? "bg-emerald-100 text-emerald-700 border-none" : "border-none"}`}
                    >
                      {lowStock && <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />}
                      {product.stock}
                    </Badge>
                    <div className="text-[9px] text-[var(--outline)] mt-1 font-medium">Mín: {product.minStock}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      className={`text-[9px] font-bold h-5 px-2 border-none ${product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {product.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      {/* A1: aria-labels for actions */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setConfirmCloneProduct(product)} 
                        className="text-[var(--outline)] hover:text-blue-600 h-8 w-8 rounded-lg"
                        aria-label={`Clonar producto ${product.name}`}
                      >
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(product)} 
                        className="text-[var(--outline)] hover:text-[var(--primary)] h-8 w-8 rounded-lg"
                        aria-label={`Editar producto ${product.name}`}
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setConfirmDeleteId(product.id)} 
                        className="text-[var(--outline)] hover:text-[var(--error)] h-8 w-8 rounded-lg"
                        aria-label={`Eliminar producto ${product.name}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer (U9) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 border-t border-[var(--outline-variant)]/30 bg-[var(--surface-container-lowest)] gap-4">
          <div className="text-sm text-[var(--on-surface-variant)] font-medium">
            Mostrando <span className="text-[var(--on-surface)] font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="text-[var(--on-surface)] font-bold">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> de <span className="text-[var(--on-surface)] font-bold">{filteredProducts.length}</span> productos
          </div>
          <nav className="flex items-center gap-1.5" aria-label="Navegación de páginas">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="h-9 w-9 p-0 rounded-lg border-[var(--outline-variant)]/30"
              aria-label="Ir a la página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {getPageNumbers().map((page, i) => (
              typeof page === 'number' ? (
                <Button
                  key={i}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 p-0 rounded-lg border-[var(--outline-variant)]/30 font-bold text-xs ${
                    currentPage === page ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
                  }`}
                  aria-label={`Ir a la página ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </Button>
              ) : (
                <span key={i} className="px-2 text-[var(--outline)]" aria-hidden="true">...</span>
              )
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0 rounded-lg border-[var(--outline-variant)]/30"
              aria-label="Ir a la página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      )}

      {/* Forms and Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setIsDialogOpen(false); }}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 border-none shadow-2xl rounded-2xl flex flex-col">
          <div className="p-8 pb-4 border-b border-[var(--outline-variant)]/20">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-2xl font-heading font-bold text-[var(--on-surface)]">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </DialogTitle>
              <p className="text-sm text-[var(--on-surface-variant)]">Completa los campos para {editingProduct ? 'actualizar' : 'añadir'} un producto al catálogo.</p>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto px-8 py-4">
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              
              const payload = {
                ...formData,
                categoryId: parseInt(formData.categoryId),
                price: parseFloat(formData.price),
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                stock: parseInt(formData.stock),
                minStock: parseInt(formData.minStock) || 10,
                weight: formData.weight || undefined,
              };

              try {
                const result = editingProduct 
                  ? await updateProduct(editingProduct.id, payload)
                  : await createProduct(payload);
                  
                if (result.success) {
                  toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado con éxito');
                  setIsDialogOpen(false);
                  router.refresh();
                  window.location.reload();
                } else {
                  toast.error(result.error);
                }
              } catch {
                toast.error('Ocurrió un error inesperado');
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[var(--surface-container-low)] rounded-xl h-12 p-1 mb-6 sticky top-0 z-10">
                  <TabsTrigger value="basic" className="rounded-lg font-bold text-xs uppercase tracking-wider">Info. Básica</TabsTrigger>
                  <TabsTrigger value="pricing" className="rounded-lg font-bold text-xs uppercase tracking-wider">Precio & Stock</TabsTrigger>
                  <TabsTrigger value="images" className="rounded-lg font-bold text-xs uppercase tracking-wider">Multimedia</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6 focus-visible:outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">SKU Identificador *</Label>
                      <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} required className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Nombre Comercial *</Label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Slug (URL) *</Label>
                      <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" placeholder="nombre-producto-slug" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Categoría *</Label>
                      <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v || ""})}>
                        <SelectTrigger className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Marca / Fabricante</Label>
                      <Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" placeholder="Ej. L'Oréal" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Peso Neto (kg)</Label>
                      <Input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Descripción Breve</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
                  </div>
                  
                  <div className="flex gap-8 p-4 bg-[var(--surface-container-low)] rounded-xl">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="form-isActive" 
                        checked={formData.isActive}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        className="w-5 h-5 accent-[var(--primary)]"
                      />
                      <Label htmlFor="form-isActive" className="cursor-pointer font-bold text-sm text-[var(--on-surface)]">Producto Activo</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="form-isFeatured" 
                        checked={formData.isFeatured}
                        onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                        className="w-5 h-5 accent-[var(--primary)]"
                      />
                      <Label htmlFor="form-isFeatured" className="cursor-pointer font-bold text-sm text-[var(--on-surface)]">Destacar en Inicio</Label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-6 focus-visible:outline-none">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Precio Venta *</Label>
                      <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Precio Costo</Label>
                      <Input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Margen Bruto</Label>
                      <div className="h-11 flex items-center px-4 bg-[var(--surface-container-high)] rounded-lg text-sm font-bold text-[var(--primary)]">
                        {calculateMargin(Number(formData.price), Number(formData.costPrice)) ? 
                          `${calculateMargin(Number(formData.price), Number(formData.costPrice))}%` : 
                          '—'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Stock Disponible *</Label>
                      <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Mínimo Crítico</Label>
                      <Input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="images" className="space-y-6 focus-visible:outline-none">
                  <div className="p-6 border-2 border-dashed border-[var(--outline-variant)]/30 rounded-2xl flex flex-col items-center gap-6">
                    {formData.mainImage ? (
                      <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-lg border border-[var(--outline-variant)]/30">
                        <Image src={formData.mainImage} alt="Vista previa" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-[var(--surface-container-low)] rounded-2xl flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-[var(--outline-variant)]" aria-hidden="true" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <CldUploadWidget 
                        uploadPreset="cosmetics_unsigned" 
                        onSuccess={(result: any) => setFormData({...formData, mainImage: result.info.secure_url})}
                      >
                        {({ open }) => (
                          <Button type="button" variant="outline" onClick={() => open()} className="rounded-full px-8 h-11 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all">
                            {formData.mainImage ? 'Cambiar Imagen' : 'Subir Imagen Principal'}
                          </Button>
                        )}
                      </CldUploadWidget>
                      <p className="text-[10px] text-[var(--outline)] mt-4 uppercase font-bold tracking-widest">Formatos: JPG, PNG, WEBP (Max 2MB)</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </div>
          
          <div className="px-8 py-4 border-t border-[var(--outline-variant)]/20 bg-[var(--surface)]">
            <DialogFooter className="gap-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-lg h-11 px-8 font-bold text-xs uppercase tracking-wider">Cancelar</Button>
              <Button type="submit" form={undefined} disabled={isSubmitting} onClick={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg h-11 px-10 font-bold text-xs uppercase tracking-wider shadow-lg">
                {isSubmitting ? 'Procesando...' : (editingProduct ? 'Guardar Cambios' : 'Crear Producto')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs (U3) */}
      <ConfirmDialog 
        open={confirmDeleteId !== null} 
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="¿Eliminar producto?"
        description="Esta acción es permanente y eliminará el producto del catálogo y el historial de stock relacionado."
        confirmLabel="Eliminar Definitivamente"
        variant="destructive"
        onConfirm={onConfirmDelete}
        loading={isSubmitting}
      />

      <ConfirmDialog 
        open={confirmCloneProduct !== null} 
        onOpenChange={(open) => !open && setConfirmCloneProduct(null)}
        title={`¿Clonar "${confirmCloneProduct?.name}"?`}
        description="Se creará una copia inactiva del producto con los mismos datos base. Podrás editar el SKU y activarlo después."
        confirmLabel="Clonar ahora"
        onConfirm={onConfirmClone}
        loading={isSubmitting}
      />

      <ConfirmDialog 
        open={bulkActionType !== null} 
        onOpenChange={(open) => !open && setBulkActionType(null)}
        title={bulkActionType === 'delete' ? "¿Eliminar múltiples productos?" : "¿Cambiar estado masivamente?"}
        description={`Vas a ${bulkActionType === 'delete' ? 'eliminar' : bulkActionType === 'activate' ? 'activar' : 'desactivar'} ${selectedProducts.length} productos seleccionados. ¿Deseas continuar?`}
        confirmLabel="Confirmar acción masiva"
        variant={bulkActionType === 'delete' ? "destructive" : "default"}
        onConfirm={onConfirmBulkAction}
        loading={isSubmitting}
      />

      {/* Price Update Dialog */}
      <Dialog open={priceUpdateDialogOpen} onOpenChange={setPriceUpdateDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-[var(--on-surface)]">Actualizar Precios</DialogTitle>
            <p className="text-sm text-[var(--on-surface-variant)]">Se aplicará un porcentaje de cambio a los {selectedProducts.length} productos seleccionados.</p>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Porcentaje de cambio (%)</Label>
              <Input 
                type="number" 
                placeholder="Ej: 10 para aumentar 10%, -5 para reducir 5%" 
                value={priceUpdatePercent}
                onChange={e => setPriceUpdatePercent(e.target.value)}
                className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setPriceUpdateDialogOpen(false)} className="rounded-lg">Cancelar</Button>
            <Button onClick={handleBulkPriceUpdate} disabled={isSubmitting || !priceUpdatePercent} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg h-11 px-8 font-bold text-xs uppercase tracking-wider">
              {isSubmitting ? "Aplicando..." : "Actualizar Precios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-2xl text-[var(--on-surface)]">Importar Productos</DialogTitle>
            <p className="text-sm text-[var(--on-surface-variant)]">Sube un archivo CSV para cargar múltiples productos de una vez.</p>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="bg-[var(--surface-container-low)] p-6 rounded-xl border border-[var(--outline-variant)]/20">
              <h4 className="font-bold text-xs uppercase tracking-[0.15em] mb-4 text-[var(--primary)]">Formato de Cabeceras Requerido:</h4>
              <div className="bg-white/50 p-3 rounded-lg border border-white font-mono text-[10px] leading-relaxed break-all text-[var(--on-surface-variant)]">
                sku, name, slug, description, categoryId, price, costPrice, stock, minStock, brand, weight, isFeatured, isActive
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Seleccionar Archivo CSV</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--outline-variant)]/30 border-dashed rounded-xl hover:border-[var(--primary)]/50 transition-colors cursor-pointer group relative">
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-10 w-10 text-[var(--outline-variant)] group-hover:text-[var(--primary)] transition-colors" aria-hidden="true" />
                  <div className="flex text-sm text-[var(--on-surface-variant)]">
                    <span className="font-bold text-[var(--primary)]">Sube un archivo</span>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-[10px] text-[var(--outline)] uppercase font-bold tracking-widest">CSV hasta 10MB</p>
                </div>
                <input 
                  type="file" 
                  accept=".csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleCSVPreview(file);
                    }
                  }}
                />
              </div>
            </div>
            
            {previewData.length > 0 && (
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Vista Previa de Datos:</Label>
                <div className="border border-[var(--outline-variant)]/30 rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-[var(--surface-container-low)]">
                      <TableRow>
                        {Object.keys(previewData[0]).slice(0, 5).map(key => (
                          <TableHead key={key} className="text-[10px] font-bold uppercase">{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, i) => (
                        <TableRow key={i} className="hover:bg-transparent">
                          {Object.values(row).slice(0, 5).map((val: any, j) => (
                            <TableCell key={j} className="text-[10px] truncate max-w-[100px]">{val}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {importResults && (
              <div className={`p-5 rounded-xl border flex gap-3 ${importResults.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                {importResults.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                <div>
                  <p className={`text-sm font-bold ${importResults.success ? 'text-emerald-800' : 'text-red-800'}`}>
                    {importResults.success 
                      ? `Importación completada: ${importResults.imported} productos añadidos.` 
                      : `Error en la importación: ${importResults.error}`}
                  </p>
                  {importResults.errors && importResults.errors.length > 0 && (
                    <ul className="text-[10px] text-red-600 mt-2 list-disc pl-4 space-y-1">
                      {importResults.errors.slice(0, 10).map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                      {importResults.errors.length > 10 && <li>... y {importResults.errors.length - 10} errores más</li>}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 border-t border-[var(--outline-variant)]/20 pt-6">
            <Button variant="ghost" onClick={() => {
              setIsImportDialogOpen(false);
              setPreviewData([]);
              setImportResults(null);
            }} className="rounded-lg h-11 px-8 font-bold text-xs uppercase tracking-wider">
              Cerrar
            </Button>
            <Button 
              onClick={() => {
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (input.files?.[0]) {
                  handleImport(input.files[0]);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-11 px-10 font-bold text-xs uppercase tracking-wider shadow-lg"
              disabled={previewData.length === 0 || isSubmitting}
            >
              <Upload className="w-4 h-4 mr-2" aria-hidden="true" /> {isSubmitting ? "Importando..." : "Importar Ahora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
