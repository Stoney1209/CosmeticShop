import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Favoritos | Cosmetics Shop",
};

export default async function WishlistPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/cuenta/ingresar");
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Favoritos</h1>
        <p className="mt-2 text-slate-500">Tus productos guardados para volver a verlos rápido.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.length > 0 ? (
          wishlist.map((item: any) => {
            const { id, product } = item;
            return (
            <Card key={id} className="overflow-hidden">
              <div className="aspect-[4/5] bg-slate-100">
                {product.mainImage ? (
                  <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-slate-300">+</div>
                )}
              </div>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="font-semibold text-slate-900">{product.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">${Number(product.price).toFixed(2)}</p>
                </div>
                <Link
                  href={`/producto/${product.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Ver producto
                </Link>
              </CardContent>
            </Card>
            );
          })
        ) : (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-10 text-center text-slate-500">
              Aún no has guardado productos en favoritos.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
