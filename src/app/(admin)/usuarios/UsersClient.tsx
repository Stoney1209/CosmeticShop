"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, User, Shield, Mail, CheckCircle2, XCircle, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createUser, updateUser, deleteUser } from "@/app/actions/users";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ username: "", fullName: "", email: "", password: "", role: "OPERATOR", isActive: true });

  // Use useMemo for filtering to improve performance
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const lowerSearch = searchTerm.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(lowerSearch) ||
      u.fullName.toLowerCase().includes(lowerSearch) ||
      (u.email && u.email.toLowerCase().includes(lowerSearch))
    );
  }, [searchTerm, users]);

  const handleEdit = (u: any) => {
    setEditing(u);
    setForm({
      username: u.username,
      fullName: u.fullName,
      email: u.email ?? "",
      password: "",
      role: u.role,
      isActive: u.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsSubmitting(true);
    try {
      const res = await deleteUser(confirmDeleteId);
      if (res.success) {
        setUsers(users.filter(u => u.id !== confirmDeleteId));
        toast.success("Usuario eliminado exitosamente");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error("Error al eliminar");
    } finally {
      setIsSubmitting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = editing ? await updateUser(editing.id, form) : await createUser(form);
      if (res.success) {
        toast.success(editing ? "Usuario actualizado" : "Usuario creado");
        setIsDialogOpen(false);
        router.refresh();
        // Update local state instead of reload
        if (editing) {
          setUsers(users.map(u => u.id === editing.id ? { ...u, ...form } : u));
        } else {
          // If creating, we might need the ID from response, but for now router.refresh() works well
          window.location.reload(); 
        }
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <Card className="border-[var(--outline-variant)]/30 shadow-sm overflow-hidden">
        <CardHeader className="bg-[var(--surface-container-lowest)] border-b border-[var(--outline-variant)]/30 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--primary-container)]/10 rounded-xl">
                <Shield className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-heading font-bold text-[var(--on-surface)]">Usuarios del Sistema</CardTitle>
                <p className="text-sm text-[var(--on-surface-variant)] mt-0.5">Gestiona el acceso al panel administrativo</p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl h-11 px-6 shadow-md" onClick={() => {setEditing(null); setForm({username:"", fullName:"", email:"", password:"", role:"OPERATOR", isActive:true})}}>
                    <Plus className="w-4 h-4 mr-2"/> Nuevo Usuario
                  </Button>
                }
              />
              <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="p-8 pb-4 border-b border-[var(--outline-variant)]/20">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-bold text-[var(--on-surface)]">
                      {editing ? "Editar Perfil" : "Crear Usuario"}
                    </DialogTitle>
                    <p className="text-sm text-[var(--on-surface-variant)] mt-1">Configura las credenciales y permisos</p>
                  </DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Usuario</Label>
                        <Input value={form.username} onChange={e=>setForm({...form, username: e.target.value})} className="h-10 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" required/>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Nombre Completo</Label>
                        <Input value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})} className="h-10 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" required/>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Correo Electrónico</Label>
                      <Input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="h-10 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Contraseña {editing && "(dejar en blanco para no cambiar)"}</Label>
                      <Input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="h-10 rounded-lg bg-[var(--surface-container-low)] border-[var(--outline-variant)]/30" required={!editing}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Rol de Acceso</Label>
                        <Select value={form.role} onValueChange={v=>setForm({...form, role: v ?? "OPERATOR"})}>
                          <SelectTrigger className="h-10 rounded-lg border-[var(--outline-variant)]/30"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                            <SelectItem value="OPERATOR">Operador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Estado de Cuenta</Label>
                        <Select value={form.isActive?"true":"false"} onValueChange={v=>setForm({...form, isActive: v==="true"})}>
                          <SelectTrigger className="h-10 rounded-lg border-[var(--outline-variant)]/30"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Activo</SelectItem>
                            <SelectItem value="false">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="pt-4 gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-[var(--primary)] text-white rounded-xl px-8 font-bold">
                      {isSubmitting ? "Procesando..." : "Guardar Cambios"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <div className="p-4 bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)]/20 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
            <Input 
              placeholder="Buscar por nombre o usuario..." 
              className="pl-10 h-10 bg-white border-[var(--outline-variant)]/30 rounded-lg shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <TableHead className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px] pl-6">Usuario</TableHead>
                <TableHead className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Nombre Completo</TableHead>
                <TableHead className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Rol / Permisos</TableHead>
                <TableHead className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Estado</TableHead>
                <TableHead className="text-right pr-6 font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[var(--outline)] italic">
                    No se encontraron usuarios activos con ese criterio.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(u => (
                  <TableRow key={u.id} className="group hover:bg-[var(--surface-container-lowest)] transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--primary)] font-bold text-xs border border-[var(--outline-variant)]/30">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[var(--on-surface)]">{u.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--on-surface)]">{u.fullName}</span>
                        {u.email && (
                          <span className="text-[10px] flex items-center gap-1 text-[var(--outline)] mt-0.5">
                            <Mail className="w-3 h-3" /> {u.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-bold text-[9px] uppercase tracking-wider px-2 border-[var(--outline-variant)]/50 ${u.role === 'ADMIN' ? 'text-[var(--primary)] bg-[var(--primary-container)]/10 border-[var(--primary)]/20' : 'text-[var(--on-surface-variant)]'}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[9px] uppercase tracking-wider px-2">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-bold text-[9px] uppercase tracking-wider px-2">
                          <XCircle className="w-3 h-3 mr-1" /> Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={()=>handleEdit(u)} className="text-[var(--outline)] hover:text-[var(--primary)] h-8 w-8 rounded-lg" aria-label="Editar">
                          <Pencil className="w-4 h-4"/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={()=>setConfirmDeleteId(u.id)} className="text-[var(--outline)] hover:text-[var(--error)] h-8 w-8 rounded-lg" aria-label="Eliminar">
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar usuario?"
        description="Esta acción no se puede deshacer. El usuario perderá acceso inmediato al panel."
        confirmLabel="Eliminar permanentemente"
        variant="destructive"
        loading={isSubmitting}
      />
    </div>
  );
}
