"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createUser, updateUser, deleteUser } from "@/app/actions/users";

export function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  
  const [form, setForm] = useState({ username: "", fullName: "", email: "", password: "", role: "OPERATOR", isActive: true });

  const handleEdit = (u: any) => { setEditing(u); setForm({ ...u, password: "" }); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => {
    if(!confirm("¿Eliminar usuario?")) return;
    const res = await deleteUser(id);
    if(res.success) setUsers(users.filter(u => u.id !== id));
    else toast.error(res.error);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editing ? await updateUser(editing.id, form) : await createUser(form);
    if (res.success) {
      toast.success("Usuario guardado");
      window.location.reload(); // Simple reload for state sync
    } else toast.error(res.error);
  };

  return (
    <div>
      <div className="p-4 border-b flex justify-between bg-slate-50">
        <Input placeholder="Buscar..." className="max-w-xs bg-white" />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => {setEditing(null); setForm({username:"", fullName:"", email:"", password:"", role:"OPERATOR", isActive:true})}}><Plus className="w-4 h-4 mr-2"/> Nuevo Usuario</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Usuario</Label><Input value={form.username} onChange={e=>setForm({...form, username: e.target.value})} required/></div>
                <div className="space-y-1"><Label>Nombre Completo</Label><Input value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})} required/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})}/></div>
                <div className="space-y-1"><Label>Contraseña {editing && "(en blanco para mantener)"}</Label><Input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required={!editing}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Rol</Label>
                  <Select value={form.role} onValueChange={v=>setForm({...form, role: v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="ADMIN">Administrador</SelectItem><SelectItem value="OPERATOR">Operador</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Estado</Label>
                  <Select value={form.isActive?"true":"false"} onValueChange={v=>setForm({...form, isActive: v==="true"})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="true">Activo</SelectItem><SelectItem value="false">Inactivo</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Usuario</TableHead><TableHead>Nombre</TableHead><TableHead>Rol</TableHead><TableHead>Estado</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell className="font-bold">{u.username}</TableCell>
              <TableCell>{u.fullName}<br/><span className="text-xs text-slate-500">{u.email}</span></TableCell>
              <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
              <TableCell>{u.isActive ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={()=>handleEdit(u)}><Pencil className="w-4 h-4"/></Button>
                <Button variant="ghost" size="icon" onClick={()=>handleDelete(u.id)}><Trash2 className="w-4 h-4"/></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
