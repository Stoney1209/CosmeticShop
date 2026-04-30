import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";
import { WishlistRemoveButton } from "@/components/shop/WishlistRemoveButton";
import { Heart } from "lucide-react";

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
    <div className="space-y-6">
      {wishlist.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item: any) => {
            const { id, product } = item;
            return (
              <Card key={id} className="overflow-hidden group">
                <div className="relative aspect-[4/5] bg-slate-100">
                  {product.mainImage ? (
                    <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-slate-300">
                      <Heart className="h-12 w-12" />
                    </div>
                  )}
                  {/* Remove button overlay */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <WishlistRemoveButton wishlistId={id} productName={product.name} />
                  </div>
                </div>
                <CardContent className="space-y-4 p-5">
                  <div>
                    <h2 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h2>
                    <p className="mt-1 text-lg font-bold text-pink-600">${Number(product.price).toFixed(2)}</p>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-slate-900 hover:bg-slate-800"
                  >
                    <Link href={`/producto/${product.slug}`}>
                      Ver producto
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No tienes productos guardados en favoritos.</p>
            <Button asChild className="bg-pink-600 hover:bg-pink-700">
              <Link href="/tienda">Explorar productos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
