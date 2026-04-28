import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerAccountForm } from "@/components/shop/CustomerAccountForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Mi cuenta | Cosmetics Shop",
};

export default async function MyAccountPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/cuenta/ingresar");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.id },
    include: {
      addresses: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      _count: {
        select: {
          orders: true,
          wishlist: true,
          reviews: true,
        },
      },
    },
  });

  if (!customer) {
    redirect("/cuenta/ingresar");
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mi cuenta</h1>
        <p className="mt-2 text-slate-500">Administra tu perfil y revisa la actividad de tu cuenta.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{customer._count.orders}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">Pedidos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{customer._count.wishlist}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">Favoritos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{customer._count.reviews}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">Reseñas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navegación rápida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Link href="/mis-pedidos" className="block rounded-xl border border-slate-200 px-4 py-3 hover:border-pink-300 hover:text-pink-600">
                Ver mis pedidos
              </Link>
              <Link href="/favoritos" className="block rounded-xl border border-slate-200 px-4 py-3 hover:border-pink-300 hover:text-pink-600">
                Ver favoritos
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerAccountForm
              customer={{
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

