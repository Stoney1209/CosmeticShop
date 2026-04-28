"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";

// Adjust according to Prisma schema types if needed
type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
  parent?: Category | null;
  _count?: {
    products: number;
    children: number;
  };
};

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("none");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("none");
    setDisplayOrder(0);
    setIsActive(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setParentId(cat.parentId ? cat.parentId.toString() : "none");
    setDisplayOrder(cat.displayOrder);
    setIsActive(cat.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    
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
      name,
      slug,
      description,
      parentId: parentId !== "none" ? parseInt(parentId) : undefined,
      displayOrder: Number(displayOrder),
      isActive,
    };

    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, {
          ...data,
          parentId: parentId !== "none" ? parseInt(parentId) : null,
        });
        
        if (result.success && result.category) {
          toast.success("Categoría actualizada con éxito");
          setCategories(categories.map(c => c.id === result.category!.id ? { ...c, ...result.category, _count: editingCategory._count, parent: categories.find(p => p.id === result.category!.parentId) } : c));
          setIsDialogOpen(false);
        } else {
          toast.error(result.error || "Error al actualizar");
        }
      } else {
        const result = await createCategory(data);
        if (result.success && result.category) {
          toast.success("Categoría creada con éxito");
          setCategories([...categories, { ...result.category, _count: { products: 0, children: 0 }, parent: categories.find(p => p.id === result.category!.parentId) }]);
          setIsDialogOpen(false);
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
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  return (
    <div>
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
        <Input placeholder="Buscar categoría..." className="max-w-xs bg-white" />
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoría" : "Crear Nueva Categoría"}</DialogTitle>
              <DialogDescription>
                Completa los detalles de la categoría. El slug se utiliza para la URL.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="parent">Categoría Padre</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger id="parent">
                    <SelectValue placeholder="Ninguna (Principal)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna (Categoría Principal)</SelectItem>
                    {categories.filter(c => c.id !== editingCategory?.id).map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Orden de visualización</Label>
                  <Input id="order" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value))} />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <Button 
                    type="button" 
                    variant={isActive ? "default" : "outline"}
                    className={isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                    onClick={() => setIsActive(!isActive)}
                  >
                    {isActive ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                    {isActive ? "Activa" : "Inactiva"}
                  </Button>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Categoría"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead className="w-[250px]">Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Jerarquía</TableHead>
            <TableHead className="text-center">Productos</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                No hay categorías registradas.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id} className="group">
                <TableCell className="font-medium text-slate-900">{category.name}</TableCell>
                <TableCell className="text-slate-500 font-mono text-xs">{category.slug}</TableCell>
                <TableCell>
                  {category.parent ? (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                      Sub de: {category.parent.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-pink-600 border-pink-200 bg-pink-50 font-medium">
                      Principal
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center text-slate-600">{category._count?.products || 0}</TableCell>
                <TableCell className="text-center">
                  {category.isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent">Activa</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100">Inactiva</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-blue-600" onClick={() => handleEdit(category)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-red-600" onClick={() => handleDelete(category.id)}>
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
