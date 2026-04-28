import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/components/shop/CustomerAuthForm";
import { getCustomerSession } from "@/lib/customer-session";

export const metadata = {
  title: "Ingresar | Cosmetics Shop",
};

export default async function CustomerLoginPage() {
  const session = await getCustomerSession();

  if (session) {
    redirect("/mi-cuenta");
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <CustomerAuthForm mode="login" />
      </div>
    </div>
  );
}

