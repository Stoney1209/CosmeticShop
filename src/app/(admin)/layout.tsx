import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // V6: admin bg differentiated from shop with slate-50
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />
        {/* A4: Semantic main landmark with id for skip-link target */}
        <main id="admin-content" className="flex-1 overflow-y-auto p-6 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
        {/* U10/P7: Removed ornamental AdminFooter — minimal status in sidebar instead */}
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
