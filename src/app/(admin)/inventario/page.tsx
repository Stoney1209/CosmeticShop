import { Card, CardContent } from "@/components/ui/card";
import { getInventory } from "@/app/actions/inventory";
import { InventoryClient } from "./InventoryClient";

export const metadata = { title: "Inventario | Admin" };

export default async function InventoryPage() {
  const { products, movements } = await getInventory();
  
  // Serialize
  const sProducts = products.map((product: any) => ({ ...product, price: Number(product.price), costPrice: Number(product.costPrice || 0) }));
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventario</h2>
        <p className="text-slate-500">Visualiza niveles de stock y ajusta cantidades manualmente.</p>
      </div>
      <Card><CardContent className="p-0"><InventoryClient products={sProducts} movements={movements} /></CardContent></Card>
    </div>
  );
}
