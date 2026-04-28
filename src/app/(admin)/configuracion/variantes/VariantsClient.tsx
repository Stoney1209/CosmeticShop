"use client";

import { useState } from "react";
import { Plus, Trash2, Palette, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createVariantType, deleteVariantType, createVariantValue, deleteVariantValue } from "@/app/actions/variants";
import { toast } from "sonner";

interface VariantValue {
  id: number;
  value: string;
  hexColor: string | null;
}

interface VariantType {
  id: number;
  name: string;
  slug: string;
  values: VariantValue[];
}

export function VariantsClient({ initialData }: { initialData: VariantType[] }) {
  const [types, setTypes] = useState(initialData);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeSlug, setNewTypeSlug] = useState("");
  
  // State for new value being added to a specific type
  const [newValueMap, setNewValueMap] = useState<{[key: number]: string}>({});
  const [newColorMap, setNewColorMap] = useState<{[key: number]: string}>({});

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName || !newTypeSlug) return;
    
    try {
      const result = await createVariantType(newTypeName, newTypeSlug);
      setTypes([...types, { ...result, values: [] }]);
      setNewTypeName("");
      setNewTypeSlug("");
      toast.success("Tipo de variante creado");
    } catch (error) {
      toast.error("Error al crear el tipo");
    }
  };

  const handleDeleteType = async (id: number) => {
    if (!confirm("¿Eliminar este tipo y todos sus valores?")) return;
    try {
      await deleteVariantType(id);
      setTypes(types.filter(t => t.id !== id));
      toast.success("Eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleCreateValue = async (typeId: number) => {
    const value = newValueMap[typeId];
    if (!value) return;

    try {
      const result = await createVariantValue({ 
        variantTypeId: typeId, 
        value, 
        hexColor: newColorMap[typeId] || undefined 
      });
      
      setTypes(types.map(t => 
        t.id === typeId ? { ...t, values: [...t.values, result] } : t
      ));
      
      setNewValueMap({ ...newValueMap, [typeId]: "" });
      setNewColorMap({ ...newColorMap, [typeId]: "" });
      toast.success("Valor agregado");
    } catch (error) {
      toast.error("Error al agregar valor");
    }
  };

  const handleDeleteValue = async (typeId: number, valueId: number) => {
    try {
      await deleteVariantValue(valueId);
      setTypes(types.map(t => 
        t.id === typeId ? { ...t, values: t.values.filter(v => v.id !== valueId) } : t
      ));
      toast.success("Valor eliminado");
    } catch (error) {
      toast.error("Error al eliminar valor");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Variantes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Define los atributos de tus productos (ej: Color, Tono, Talla)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulario Crear Tipo */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-pink-500" /> Nuevo Atributo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateType} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Nombre (ej: Color)</label>
                <Input value={newTypeName} onChange={e => setNewTypeName(e.target.value)} placeholder="Color, Talla, Tono..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Slug (ej: color)</label>
                <Input value={newTypeSlug} onChange={e => setNewTypeSlug(e.target.value.toLowerCase())} placeholder="slug-unico" />
              </div>
              <Button type="submit" className="w-full bg-slate-900">Crear Atributo</Button>
            </form>
          </CardContent>
        </Card>

        {/* Listado de Tipos y sus Valores */}
        <div className="lg:col-span-2 space-y-6">
          {types.map((type) => (
            <Card key={type.id} className="overflow-hidden border-pink-100">
              <CardHeader className="bg-slate-50 flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg font-bold text-slate-800">
                  {type.name} <span className="text-xs font-normal text-muted-foreground ml-2">({type.slug})</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteType(type.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Lista de Valores Actuales */}
                <div className="flex flex-wrap gap-2">
                  {type.values.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 bg-white border border-slate-200 pl-2 pr-1 py-1 rounded-full text-sm shadow-sm hover:border-pink-300 transition-colors">
                      {v.hexColor && (
                        <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: v.hexColor }} />
                      )}
                      <span className="font-medium text-slate-700">{v.value}</span>
                      <button onClick={() => handleDeleteValue(type.id, v.id)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {type.values.length === 0 && <p className="text-sm text-muted-foreground italic">No hay valores definidos</p>}
                </div>

                {/* Formulario para Agregar Valor */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Nuevo Valor</label>
                    <Input 
                      value={newValueMap[type.id] || ""} 
                      onChange={e => setNewValueMap({...newValueMap, [type.id]: e.target.value})} 
                      placeholder="Ej: Rojo Pasión, XL, 30ml..." 
                      className="bg-white"
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Color Hex</label>
                    <div className="flex gap-1">
                      <Input 
                        type="color"
                        value={newColorMap[type.id] || "#000000"}
                        onChange={e => setNewColorMap({...newColorMap, [type.id]: e.target.value})}
                        className="w-9 h-9 p-1 rounded-md cursor-pointer shrink-0"
                      />
                      <Input 
                        value={newColorMap[type.id] || ""}
                        onChange={e => setNewColorMap({...newColorMap, [type.id]: e.target.value})}
                        placeholder="#FFF"
                        className="text-xs h-9 bg-white"
                      />
                    </div>
                  </div>
                  <Button onClick={() => handleCreateValue(type.id)} className="bg-pink-600 hover:bg-pink-700 h-9">
                    <Plus className="w-4 h-4 mr-1" /> Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {types.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <Palette className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">Aún no has definido atributos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
