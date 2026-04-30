"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Search, History, AlertTriangle, CheckCircle2, ArrowRightLeft,
  Filter, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adjustStock } from "@/app/actions/inventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function InventoryClient({ products, movements }: { products: any[], movements: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("stock");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Adjust logic
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedProduct) return;
    setIsSubmitting(true);
    try {
      const res = await adjustStock(selectedProduct.id, parseInt(newStock), notes);
      if(res.success) {
        toast.success("Inventario actualizado correctamente");
        setIsDialogOpen(false);
        router.refresh();
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al actualizar el stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--outline-variant)]/30 shadow-sm overflow-hidden animate-fade-up">
      {/* Tabs / Navigation */}
      <div className="p-4 border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/50 p-1 rounded-xl h-12 border border-black/5">
            <TabsTrigger value="stock" className="flex items-center gap-2 px-6 rounded-lg font-bold text-xs uppercase tracking-wider">
              <Package className="w-4 h-4" /> Estado de Existencias
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2 px-6 rounded-lg font-bold text-xs uppercase tracking-wider">
              <History className="w-4 h-4" /> Historial de Movimientos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {activeTab === "stock" && (
        <>
          <div className="p-6 border-b border-[var(--outline-variant)]/20 bg-[var(--surface-container-lowest)] flex flex-wrap gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
              <Input 
                placeholder="Buscar por nombre o SKU..." 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)} 
                className="pl-10 h-10 bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30 rounded-lg"
                aria-label="Filtrar productos"
              />
            </div>
            {searchTerm && (
              <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="text-[var(--on-surface-variant)] h-10">
                <RotateCcw className="w-4 h-4 mr-2" /> Limpiar
              </Button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[var(--surface-container-low)]">
                <TableRow>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider">Identificador (SKU)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider">Producto</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-wider">Categoría</TableHead>
                  <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider">Existencias</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-wider">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(p => {
                  const lowStock = p.stock <= p.minStock;
                  return (
                    <TableRow key={p.id} className={`${lowStock ? 'bg-[var(--error-container)]/5' : ''} hover:bg-[var(--surface-container-lowest)] transition-colors`}>
                      <TableCell className="font-mono text-xs font-bold text-[var(--on-surface-variant)]">{p.sku}</TableCell>
                      <TableCell className="font-bold text-[var(--on-surface)] text-sm">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold border-[var(--outline-variant)]/30 text-[var(--outline)] uppercase">{p.category?.name || "Sin cat."}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {p.stock <= 0 ? (
                          <Badge variant="destructive" className="bg-[var(--error)] text-white border-none font-bold text-[9px] uppercase px-2 py-0.5">Agotado</Badge>
                        ) : lowStock ? (
                          <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[9px] uppercase px-2 py-0.5">Stock Bajo ({p.stock})</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[9px] uppercase px-2 py-0.5">{p.stock} Disponibles</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-[var(--primary-container)]/10 text-[var(--primary)]"
                          onClick={()=>{setSelectedProduct(p); setNewStock(p.stock.toString()); setNotes("Ajuste manual de inventario"); setIsDialogOpen(true);}}
                          aria-label={`Ajustar stock de ${p.name}`}
                        >
                          <ArrowRightLeft className="w-3 h-3 mr-2" /> Ajustar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {activeTab === "movements" && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[var(--surface-container-low)]">
              <TableRow>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Fecha / Hora</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Producto AFECTADO</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider text-center">Operación</TableHead>
                <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider">Cant.</TableHead>
                <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider">Balance Final</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider pr-6">Responsable / Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map(m => (
                <TableRow key={m.id} className="hover:bg-[var(--surface-container-lowest)] transition-colors">
                  <TableCell className="text-xs text-[var(--outline)] font-medium">
                    {new Date(m.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} <br/>
                    {new Date(m.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-[var(--on-surface)] text-sm">{m.product.name}</div>
                    <span className="text-[10px] font-mono text-[var(--outline)] uppercase">{m.product.sku}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {m.movementType === "IN" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[9px] uppercase tracking-tighter">Entrada</Badge>
                    ) : m.movementType === "OUT" ? (
                      <Badge className="bg-red-100 text-red-700 border-none font-bold text-[9px] uppercase tracking-tighter">Salida</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[9px] uppercase tracking-tighter">Ajuste</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-bold text-[var(--on-surface)]">
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </TableCell>
                  <TableCell className="text-center font-bold text-[var(--primary)]">{m.newStock}</TableCell>
                  <TableCell className="text-xs pr-6">
                    <div className="font-bold text-[var(--on-surface)] flex items-center gap-1">
                      <User className="w-3 h-3 text-[var(--outline)]" /> {m.user?.username || "Sistema"}
                    </div>
                    <div className="text-[10px] text-[var(--outline)] italic mt-1 leading-tight max-w-[200px]">"{m.notes}"</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-heading font-bold text-[var(--on-surface)] flex items-center gap-3">
              <div className="bg-[var(--primary-container)]/10 p-2 rounded-xl">
                <ArrowRightLeft className="w-6 h-6 text-[var(--primary)]" />
              </div>
              Ajuste de Stock
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjust} className="space-y-6">
            <div className="bg-[var(--surface-container-low)] p-4 rounded-xl mb-4 border border-[var(--outline-variant)]/20">
              <p className="text-xs font-bold text-[var(--outline)] uppercase tracking-widest mb-1">Producto</p>
              <p className="font-bold text-[var(--on-surface)]">{selectedProduct?.name}</p>
              <p className="text-[10px] font-mono text-[var(--outline)]">{selectedProduct?.sku}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Stock Actual</Label>
                <div className="h-11 flex items-center px-4 bg-[var(--surface-container-high)] rounded-lg text-sm font-bold text-[var(--outline)]">
                  {selectedProduct?.stock || 0}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Nuevo Stock *</Label>
                <Input type="number" min="0" value={newStock} onChange={e=>setNewStock(e.target.value)} required className="h-11 rounded-lg bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20 font-bold" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Motivo del Ajuste *</Label>
              <Textarea 
                value={notes} 
                onChange={e=>setNotes(e.target.value)} 
                required 
                placeholder="Ej: Corrección de inventario tras auditoría física..."
                className="rounded-lg bg-white border-[var(--outline-variant)]/30 focus-visible:ring-[var(--primary)]/20 text-sm"
                rows={3}
              />
            </div>

            <DialogFooter className="mt-8 gap-3 border-t border-black/5 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-11 rounded-lg px-6 font-bold text-xs uppercase tracking-wider">Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg h-11 px-10 font-bold text-xs uppercase tracking-wider shadow-lg">
                {isSubmitting ? 'Procesando...' : 'Guardar Ajuste'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { User } from "lucide-react";
