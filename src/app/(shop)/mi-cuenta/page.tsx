import { redirect } from "next/navigation";
import { CustomerAccountForm } from "@/components/shop/CustomerAccountForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Mi Perfil | Cosmetics Shop",
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
    },
  });

  if (!customer) {
    redirect("/cuenta/ingresar");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
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
  );
}

