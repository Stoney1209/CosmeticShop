import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { logoutCustomer } from "@/app/actions/customer-auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/cuenta/ingresar");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.id },
    include: {
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

  async function handleLogout() {
    "use server";
    await logoutCustomer();
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mi cuenta</h1>
        <p className="mt-2 text-slate-500">Administra tu perfil y revisa tu actividad.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr] items-start">
        <AccountSidebar
          customer={{
            fullName: customer.fullName,
            email: customer.email,
          }}
          stats={{
            orders: customer._count.orders,
            wishlist: customer._count.wishlist,
            reviews: customer._count.reviews,
          }}
          onLogout={handleLogout}
          isLoggingOut={false}
        />
        
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
