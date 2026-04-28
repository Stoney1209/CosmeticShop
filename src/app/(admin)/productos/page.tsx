import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./ProductsClient";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      variants: {
        include: {
          values: {
            include: { type: true }
          }
        }
      }
    }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  const variantTypes = await prisma.variantType.findMany({
    include: { values: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu catálogo de belleza, inventario y variantes.</p>
      </div>
      
      <ProductsClient 
        initialProducts={JSON.parse(JSON.stringify(products))} 
        categories={JSON.parse(JSON.stringify(categories))}
        variantTypes={JSON.parse(JSON.stringify(variantTypes))}
      />
    </div>
  );
}
