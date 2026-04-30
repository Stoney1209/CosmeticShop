"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Pencil, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, 
  Search, RotateCcw, Package, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";
import { Card, CardContent } from "@/components/ui/card";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    products: number;
    children: number;
  };
};

function CategoryTreeItem({ 
  category, 
  level, 
  expanded, 
  onToggle, 
  onEdit, 
  onDelete,
  allCategories
}: { 
  category: Category; 
  level: number;
  expanded: Set<number>;
  onToggle: (id: number) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: number) => void;
  allCategories: Category[];
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expanded.has(category.id);
  
  return (
    <div>
      <div 
        className={`flex items-center gap-2 p-3 hover:bg-slate-50 border-b border-slate-100 transition-colors ${
          !category.isActive ? 'opacity-60' : ''
        }`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Expand/Collapse button */}
        <button 
          onClick={() => hasChildren && onToggle(category.id)}
          className={`w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 ${
            hasChildren ? 'cursor-pointer' : 'cursor-default opacity-0'
          }`}
        >
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </button>
        
        {/* Folder icon */}
        <div className="text-pink-500">
          {hasChildren && isExpanded ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
        </div>
        
        {/* Category info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{category.name}</span>
            {!category.isActive && (
              <Badge variant="secondary" className="text-xs">Inactiva</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">/{category.slug}</span>
            {category.description && (
              <span className="truncate max-w-xs">{category.description}</span>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {category._count?.products !== undefined && (
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>{category._count.products} productos</span>
            </div>
          )}
          {hasChildren && (
            <div className="flex items-center gap-1">
              <Folder className="w-4 h-4" />
              <span>{category.children!.length} subcategorías</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => onEdit(category)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-pink-200 ml-6">
          {category.children!.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              allCategories={allCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<number, Category>();
  const roots: Category[] = [];
  
  // First pass: create map
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });
  
  // Second pass: build tree
  categories.forEach(cat => {
    const category = categoryMap.get(cat.id)!;
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(category);
    } else {
      roots.push(category);
    }
  });
  
  // Sort by displayOrder, then by name
  const sortCategories = (cats: Category[]) => {
    cats.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });
    cats.forEach(cat => {
      if (cat.children) sortCategories(cat.children);
    });
  };
  
  sortCategories(roots);
  return roots;
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "none",
    displayOrder: 0,
    isActive: true,
  });

  const categoryTree = buildCategoryTree(categories);

  // Filter categories based on search term
  const filteredCategories = searchTerm
    ? categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : categories;

  // Auto-expand when searching
  useEffect(() => {
    if (searchTerm) {
      const parentIds = new Set<number>();
      filteredCategories.forEach(cat => {
        if (cat.parentId) {
          parentIds.add(cat.parentId);
          // Find all ancestors
          let current = categories.find(c => c.id === cat.parentId);
          while (current?.parentId) {
            parentIds.add(current.parentId);
            current = categories.find(c => c.id === current!.parentId);
          }
        }
      });
      setExpanded(new Set([...expanded, ...parentIds, ...filteredCategories.map(c => c.id)]));
    }
  }, [searchTerm]);

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const expandAll = () => {
    setExpanded(new Set(categories.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      parentId: "none",
      displayOrder: 0,
      isActive: true,
    });
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      parentId: cat.parentId ? cat.parentId.toString() : "none",
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const cat = categories.find(c => c.id === id);
    const hasChildren = categories.some(c => c.parentId === id);
    
    if (hasChildren) {
      toast.error("No se puede eliminar: esta categoría tiene subcategorías");
      return;
    }
    
    if (!confirm(`¿Estás seguro de eliminar la categoría "${cat?.name}"?`)) return;
    
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Categoría eliminada con éxito");
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        toast.error(result.error || "Error al eliminar la categoría");
      }
    } catch (e) {
      toast.error("Error inesperado al eliminar");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      parentId: formData.parentId !== "none" ? parseInt(formData.parentId) : undefined,
      displayOrder: Number(formData.displayOrder),
      isActive: formData.isActive,
    };

    try {
      if (editingCategory) {
        // Prevent setting self as parent
        if (data.parentId === editingCategory.id) {
          toast.error("Una categoría no puede ser su propia subcategoría");
          setIsSubmitting(false);
          return;
        }
        
        const result = await updateCategory(editingCategory.id, data);
        if (result.success) {
          toast.success("Categoría actualizada con éxito");
          window.location.reload();
        } else {
          toast.error(result.error || "Error al actualizar");
        }
      } else {
        const result = await createCategory(data);
        if (result.success) {
          toast.success("Categoría creada con éxito");
          window.location.reload();
        } else {
          toast.error(result.error || "Error al crear");
        }
      }
    } catch (error) {
      toast.error("Ha ocurrido un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (val: string) => {
    setFormData({ ...formData, name: val });
    if (!editingCategory) {
      setFormData(prev => ({
        ...prev,
        name: val,
        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      }));
    }
  };

  // Get parent categories (for dropdown - exclude self and descendants when editing)
  const getAvailableParents = () => {
    let available = categories.filter(c => c.isActive);
    
    if (editingCategory) {
      // Remove self
      available = available.filter(c => c.id !== editingCategory.id);
      
      // Remove all descendants to prevent cycles
      const descendants = new Set<number>();
      const addDescendants = (parentId: number) => {
        categories.filter(c => c.parentId === parentId).forEach(child => {
          descendants.add(child.id);
          addDescendants(child.id);
        });
      };
      addDescendants(editingCategory.id);
      available = available.filter(c => !descendants.has(c.id));
    }
    
    return available;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Categorías ({categories.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expandir todo
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Colapsar todo
          </Button>
          <Button 
            className="bg-pink-600 hover:bg-pink-700 text-white"
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
            <RotateCcw className="w-4 h-4 mr-1" /> Limpiar
          </Button>
        )}
      </div>

      {/* Info */}
      {!searchTerm && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AlertCircle className="w-4 h-4" />
          <span>Haz clic en la flecha para expandir/colapsar subcategorías</span>
        </div>
      )}

      {/* Tree View */}
      <Card>
        <CardContent className="p-0">
          {searchTerm ? (
            // Search results - flat list
            <div>
              <div className="px-4 py-2 bg-slate-50 text-sm text-slate-600 border-b">
                {filteredCategories.length} resultados para "{searchTerm}"
              </div>
              {filteredCategories.map(cat => (
                <div 
                  key={cat.id} 
                  className={`flex items-center gap-2 p-3 hover:bg-slate-50 border-b border-slate-100 ${
                    !cat.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <Folder className="w-5 h-5 text-pink-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{cat.name}</span>
                      {cat.parent && (
                        <Badge variant="outline" className="text-xs">
                          Subcategoría de: {cat.parent.name}
                        </Badge>
                      )}
                      {!cat.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-mono">/{cat.slug}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-600"
                      onClick={() => handleEdit(cat)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : categoryTree.length > 0 ? (
            // Tree view
            <div>
              {categoryTree.map(category => (
                <CategoryTreeItem
                  key={category.id}
                  category={category}
                  level={0}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  allCategories={categories}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Folder className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No hay categorías. Crea la primera para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Maquillaje"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Slug (URL amigable) *</Label>
              <Input 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="maquillaje"
                required
              />
              <p className="text-xs text-slate-500">Se usa en la URL: /categoria/{formData.slug}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la categoría..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Categoría Padre</Label>
              <Select 
                value={formData.parentId} 
                onValueChange={(val) => setFormData({ ...formData, parentId: val || "none" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ninguna (categoría principal)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
                  {getAvailableParents().map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Selecciona una categoría padre para crear una subcategoría
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Orden de visualización</Label>
                <Input 
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-slate-500">Menor número = aparece primero</p>
              </div>
              
              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center gap-2 h-10">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer font-normal">
                    Categoría activa
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700">
                {isSubmitting ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
