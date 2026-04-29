import { Card, CardContent } from "@/components/ui/card";
import { getCustomers } from "@/app/actions/customers";
import { CustomersClient } from "./CustomersClient";

export const metadata = { title: "Clientes | Admin" };

export default async function CustomersPage() {
  const customers = await getCustomers();
  // Serialize dates for client components
  const serializedCustomers = customers.map((customer: any) => ({
    ...customer,
    createdAt: customer.createdAt.toISOString(),
  }));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h2>
        <p className="text-slate-500">Gestiona los clientes registrados en la tienda.</p>
      </div>
      <Card><CardContent className="p-0"><CustomersClient initialCustomers={serializedCustomers} /></CardContent></Card>
    </div>
  );
}
