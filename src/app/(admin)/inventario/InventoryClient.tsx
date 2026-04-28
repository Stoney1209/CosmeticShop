"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adjustStock } from "@/app/actions/inventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InventoryClient({ products, movements }: { products: any[], movements: any[] }) {
  const [activeTab, setActiveTab] = useState("stock");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Adjust logic
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState("");
  const [notes, setNotes] = useState("");

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedProduct) return;
    const res = await adjustStock(selectedProduct.id, parseInt(newStock), notes);
    if(res.success) {
      toast.success("Inventario actualizado");
      window.location.reload();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div>
      <div className="p-4 border-b bg-slate-50">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="stock">Estado Actual</TabsTrigger>
            <TabsTrigger value="movements">Historial de Movimientos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {activeTab === "stock" && (
        <>
          <div className="p-4 border-b"><Input placeholder="Buscar por nombre o SKU..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="max-w-md bg-white"/></div>
          <Table>
            <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Producto</TableHead><TableHead>Categoría</TableHead><TableHead className="text-center">Stock Actual</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredProducts.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{p.category?.name}</TableCell>
                  <TableCell className="text-center">
                    {p.stock <= 0 ? <Badge variant="destructive">Agotado</Badge> : p.stock <= p.minStock ? <Badge className="bg-amber-100 text-amber-800">Bajo ({p.stock})</Badge> : <Badge className="bg-emerald-100 text-emerald-800">{p.stock}</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={()=>{setSelectedProduct(p); setNewStock(p.stock.toString()); setNotes("Ajuste manual"); setIsDialogOpen(true);}}>Ajustar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {activeTab === "movements" && (
        <Table>
          <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>Tipo</TableHead><TableHead className="text-center">Cant.</TableHead><TableHead className="text-center">Stock Final</TableHead><TableHead>Usuario/Notas</TableHead></TableRow></TableHeader>
          <TableBody>
            {movements.map(m => (
              <TableRow key={m.id}>
                <TableCell className="text-sm text-slate-500">{new Date(m.createdAt).toLocaleString()}</TableCell>
                <TableCell className="font-medium">{m.product.name} <span className="text-xs text-slate-400 block">{m.product.sku}</span></TableCell>
                <TableCell>
                  {m.movementType === "IN" ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Entrada</Badge> : m.movementType === "OUT" ? <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">Salida</Badge> : <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ajuste</Badge>}
                </TableCell>
                <TableCell className="text-center font-bold">{m.quantity}</TableCell>
                <TableCell className="text-center">{m.newStock}</TableCell>
                <TableCell className="text-sm text-slate-600">{m.user?.username || "Sistema"}<br/><span className="text-xs text-slate-400">{m.notes}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajustar Inventario: {selectedProduct?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Stock Actual</Label><Input disabled value={selectedProduct?.stock || 0} /></div>
              <div className="space-y-1"><Label>Nuevo Stock</Label><Input type="number" min="0" value={newStock} onChange={e=>setNewStock(e.target.value)} required/></div>
            </div>
            <div className="space-y-1"><Label>Motivo (Notas)</Label><Input value={notes} onChange={e=>setNotes(e.target.value)} required/></div>
            <DialogFooter><Button type="submit">Guardar Ajuste</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
