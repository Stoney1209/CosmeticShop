import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { AdminFooter } from "@/components/admin/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#fcf9f8] font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
        <AdminFooter />
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
