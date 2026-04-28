import { Card, CardContent } from "@/components/ui/card";
import { getProducts } from "@/app/actions/products";
import { getCategories } from "@/app/actions/categories";
import { ProductsClient } from "./ProductsClient";

export const metadata = {
  title: "Productos | Cosmetics Admin",
};

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  // Convert Decimals to numbers for client components
  const serializedProducts = products.map(p => ({
    ...p,
    price: Number(p.price),
    costPrice: p.costPrice ? Number(p.costPrice) : null
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Productos</h2>
          <p className="text-slate-500 mt-2">Administra el catálogo, precios e inventario de tus cosméticos.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <ProductsClient initialProducts={serializedProducts} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
