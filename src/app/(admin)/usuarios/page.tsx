import { Card, CardContent } from "@/components/ui/card";
import { getUsers } from "@/app/actions/users";
import { UsersClient } from "./UsersClient";

export const metadata = { title: "Usuarios | Admin" };

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Usuarios</h2>
        <p className="text-slate-500">Gestiona los administradores y operadores del sistema.</p>
      </div>
      <Card><CardContent className="p-0"><UsersClient initialUsers={users} /></CardContent></Card>
    </div>
  );
}
