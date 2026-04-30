"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Pencil, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, 
  Search, RotateCcw, Package, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

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
        className={`flex items-center gap-2 p-3 hover:bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)]/20 transition-colors ${
          !category.isActive ? 'opacity-60' : ''
        }`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <button 
          onClick={() => hasChildren && onToggle(category.id)}
          className={`w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface-container-high)] ${
            hasChildren ? 'cursor-pointer' : 'cursor-default opacity-0'
          }`}
          aria-label={isExpanded ? "Contraer" : "Expandir"}
        >
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--outline)]" /> : <ChevronRight className="w-4 h-4 text-[var(--outline)]" />
          )}
        </button>
        
        <div className="text-[var(--primary)]">
          {hasChildren && isExpanded ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--on-surface)] text-sm">{category.name}</span>
            {!category.isActive && (
              <Badge variant="secondary" className="text-[9px] font-bold uppercase border-none bg-slate-100 text-slate-500">Inactiva</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--outline)] mt-1">
            <span className="font-mono bg-[var(--surface-container-high)] px-1.5 py-0.5 rounded">/{category.slug}</span>
            {category.description && (
              <span className="truncate max-w-xs">{category.description}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[var(--outline)]">
          {category._count?.products !== undefined && (
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-[var(--primary)]" />
              <span>{category._count.products} prod.</span>
            </div>
          )}
          {hasChildren && (
            <div className="flex items-center gap-1">
              <Folder className="w-4 h-4 text-[var(--primary)]" />
              <span>{category.children!.length} subcat.</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-[var(--outline)] hover:text-[var(--primary)]"
            onClick={() => onEdit(category)}
            aria-label={`Editar ${category.name}`}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-[var(--outline)] hover:text-[var(--error)]"
            onClick={() => onDelete(category.id)}
            aria-label={`Eliminar ${category.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-[var(--primary-container)]/30 ml-6">
          {category.children!.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              allCategories={[]} // Not strictly needed inside Item
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
  
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });
  
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
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "none",
    displayOrder: 0,
    isActive: true,
  });

  const categoryTree = buildCategoryTree(categories);

  const filteredCategories = searchTerm
    ? categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : categories;

  useEffect(() => {
    if (searchTerm) {
      const parentIds = new Set<number>();
      filteredCategories.forEach(cat => {
        if (cat.parentId) {
          parentIds.add(cat.parentId);
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

  const expandAll = () => setExpanded(new Set(categories.map(c => c.id)));
  const collapseAll = () => setExpanded(new Set());

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

  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setIsSubmitting(true);
    try {
      const result = await deleteCategory(confirmDeleteId);
      if (result.success) {
        toast.success("Categoría eliminada con éxito");
        setCategories(categories.filter((c) => c.id !== confirmDeleteId));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsSubmitting(false);
      setConfirmDeleteId(null);
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
        if (data.parentId === editingCategory.id) {
          toast.error("Una categoría no puede ser su propia subcategoría");
          setIsSubmitting(false);
          return;
        }
        const result = await updateCategory(editingCategory.id, data);
        if (result.success) {
          toast.success("Categoría actualizada");
          setIsDialogOpen(false);
          router.refresh();
          window.location.reload();
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createCategory(data);
        if (result.success) {
          toast.success("Categoría creada");
          setIsDialogOpen(false);
          router.refresh();
          window.location.reload();
        } else {
          toast.error(result.error);
        }
      }
    } catch {
      toast.error("Error inesperado");
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
        slug: val.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      }));
    }
  };

  const getAvailableParents = () => {
    let available = categories.filter(c => c.isActive);
    if (editingCategory) {
      available = available.filter(c => c.id !== editingCategory.id);
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
    <div className="bg-white rounded-2xl border border-[var(--outline-variant)]/30 shadow-sm overflow-hidden animate-fade-up">
      <div className="p-6 border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-lowest)] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-heading font-bold text-[var(--on-surface)]">
            Gestión de Categorías
            <span className="ml-2 text-sm font-medium text-[var(--outline)]">({categories.length})</span>
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll} className="rounded-lg h-9">Expandir todo</Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="rounded-lg h-9">Colapsar todo</Button>
            <Button 
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg h-9 shadow-sm"
              onClick={() => { resetForm(); setIsDialogOpen(true); }}
            >
              <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
            <Input
              placeholder="Buscar categorías por nombre o slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30 rounded-lg"
              aria-label="Buscar categorías"
            />
          </div>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="h-10 text-[var(--on-surface-variant)]">
              <RotateCcw className="w-4 h-4 mr-2" /> Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="p-0">
        {searchTerm ? (
          <div className="divide-y divide-[var(--outline-variant)]/20">
            {filteredCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 p-4 hover:bg-[var(--surface-container-lowest)]">
                <Folder className="w-5 h-5 text-[var(--primary)]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--on-surface)]">{cat.name}</span>
                    {cat.parent && <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold">Sub de: {cat.parent.name}</Badge>}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--outline)] uppercase tracking-tight">/{cat.slug}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--outline)]" onClick={() => handleEdit(cat)} aria-label="Editar"><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--outline)]" onClick={() => setConfirmDeleteId(cat.id)} aria-label="Eliminar"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        ) : categoryTree.length > 0 ? (
          <div className="divide-y divide-[var(--outline-variant)]/10">
            {categoryTree.map(category => (
              <CategoryTreeItem key={category.id} category={category} level={0} expanded={expanded} onToggle={toggleExpand} onEdit={handleEdit} onDelete={setConfirmDeleteId} allCategories={[]} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-[var(--outline)] italic">
            No hay categorías registradas.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-heading font-bold text-[var(--on-surface)]">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Nombre *</Label>
                <Input value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Slug (URL) *</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Categoría Padre</Label>
                <Select value={formData.parentId} onValueChange={(val) => setFormData({ ...formData, parentId: val || "none" })}>
                  <SelectTrigger className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30"><SelectValue placeholder="Principal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna (Principal)</SelectItem>
                    {getAvailableParents().map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Orden</Label>
                <Input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} className="h-11 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" />
              </div>
            </div>
            <div className="bg-[var(--surface-container-low)] p-4 rounded-xl flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 accent-[var(--primary)]" />
              <Label htmlFor="isActive" className="cursor-pointer font-bold text-sm text-[var(--on-surface)]">Categoría Activa</Label>
            </div>
            <DialogFooter className="mt-8 gap-3 border-t border-black/5 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-11 rounded-lg px-6 font-bold text-xs uppercase tracking-wider">Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg h-11 px-8 font-bold text-xs uppercase tracking-wider shadow-lg">
                {isSubmitting ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={confirmDeleteId !== null} 
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="¿Eliminar categoría?"
        description="Esta acción solo se puede realizar si la categoría no tiene subcategorías vinculadas."
        confirmLabel="Eliminar Categoría"
        variant="destructive"
        onConfirm={onConfirmDelete}
        loading={isSubmitting}
      />
    </div>
  );
}
