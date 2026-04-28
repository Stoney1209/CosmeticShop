import { Card, CardContent } from "@/components/ui/card";
import { getCategories } from "@/app/actions/categories";
import { CategoriesClient } from "./CategoriesClient";

export const metadata = {
  title: "Categorías | Cosmetics Admin",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Categorías</h2>
          <p className="text-slate-500 mt-2">Gestiona las categorías de tus productos y su jerarquía.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <CategoriesClient initialCategories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
